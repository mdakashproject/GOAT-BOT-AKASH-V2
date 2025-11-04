const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');
const request = require('request');

// Segoe UI ফন্ট
try {
  registerFont(path.join(__dirname, '../fonts/SegoeUI.ttf'), { family: 'Segoe UI' });
  registerFont(path.join(__dirname, '../fonts/SegoeUI-Bold.ttf'), { family: 'Segoe UI Bold' });
} catch (e) { console.log("Segoe UI font missing!"); }

module.exports = {
  config: {
    name: "ffinfo",
    version: "9.0",
    author: "MOHAMMAD AKASH",
    countDown: 10,
    role: 0,
    shortDescription: "FF Profile - Full Windows Look",
    category: "ff",
    guide: "{pn}ffinfo [UID]"
  },

  onStart: async function ({ message, event, args, api, usersData }) {
    const uid = args.join(" ").trim();
    if (!uid || isNaN(uid)) return message.reply("Invalid UID!");

    try {
      const { data } = await axios.get(`https://info-ob49.vercel.app/api/account/?uid=${uid}&region=BD`);
      if (!data.basicInfo) return message.reply("Player not found!");

      const basic = data.basicInfo;
      const profile = data.profileInfo || {};
      const clan = data.clanBasicInfo || { clanName: "None" };
      const winRate = basic.totalMatches > 0 ? ((basic.wins || 0) / basic.totalMatches * 100).toFixed(2) : "0.00";

      // === FB Profile Pic ===
      let fbUid = event.senderID;
      if (event.type === "message_reply") fbUid = event.messageReply.senderID;
      else if (Object.keys(event.mentions || {}).length > 0) fbUid = Object.keys(event.mentions)[0];

      const fbPicUrl = `https://graph.facebook.com/${fbUid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const cachePic = path.join(__dirname, '../cache', `fb_${fbUid}.png`);
      await fs.ensureDir(path.dirname(cachePic));

      await new Promise((r, rej) => {
        request(encodeURI(fbPicUrl)).pipe(fs.createWriteStream(cachePic)).on('close', r).on('error', rej);
      });

      // === Canvas ===
      const canvas = createCanvas(1000, 700);
      const ctx = canvas.getContext('2d');

      // Background
      const bg = ctx.createLinearGradient(0, 0, 1000, 700);
      bg.addColorStop(0, "#001122"); bg.addColorStop(1, "#0a1a2a");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1000, 700);

      // Main Window
      ctx.fillStyle = "rgba(20, 20, 40, 0.92)";
      ctx.fillRect(40, 40, 920, 560);
      ctx.strokeStyle = "#3399ff"; ctx.lineWidth = 2; ctx.strokeRect(40, 40, 920, 560);

      // Title Bar
      ctx.fillStyle = "#1a1a2e"; ctx.fillRect(40, 40, 920, 60);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 26px 'Segoe UI Bold'"; ctx.textAlign = "left";
      ctx.fillText("Free Fire Profile - Garena", 70, 82);

      // Window Buttons
      [{c:"#ffbd44",x:870}, {c:"#00ca4e",x:900}, {c:"#ff605c",x:930}].forEach(b => {
        ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, 70, 8, 0, Math.PI*2); ctx.fill();
      });

      // === Rank Badge (Left) ===
      let rankKey = "Unranked";
      if (basic.rank && typeof basic.rank === "string") rankKey = basic.rank.trim().split(" ")[0];
      const rankFile = { Bronze: "bronze", Silver: "silver", Gold: "gold", Platinum: "platinum", Diamond: "diamond", Heroic: "heroic", Grandmaster: "grandmaster" }[rankKey] || "unranked";

      try {
        const rankPath = path.join(__dirname, `../assets/ranks/${rankFile}.png`);
        if (fs.existsSync(rankPath)) {
          const icon = await loadImage(rankPath);
          ctx.drawImage(icon, 80, 130, 80, 80);
        }
      } catch (e) {}

      // === Free Fire Logo (Center) ===
      try {
        const ffLogoPath = path.join(__dirname, '../assets/ff_logo.png');
        if (fs.existsSync(ffLogoPath)) {
          const logo = await loadImage(ffLogoPath);
          ctx.drawImage(logo, 380, 100, 240, 140);
        }
      } catch (e) {}

      // === Profile Pic (Right) ===
      let avatar = await loadImage(cachePic).catch(() => loadImage("https://i.imgur.com/8Y5z3fK.png"));
      ctx.save(); ctx.beginPath(); ctx.arc(830, 170, 70, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      ctx.drawImage(avatar, 760, 100, 140, 140); ctx.restore();
      ctx.strokeStyle = "#3399ff"; ctx.lineWidth = 3; ctx.stroke();

      // === Player Name + UID ===
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 36px 'Segoe UI Bold'"; ctx.textAlign = "center";
      ctx.fillText((basic.nickname || "Unknown").toUpperCase(), 500, 280);
      ctx.font = "24px 'Segoe UI'"; ctx.fillStyle = "#88ccff";
      ctx.fillText(basic.accountId || uid, 500, 315);

      // === Stats - 2 Columns ===
      const statsLeft = [
        { l: "LEVEL", v: basic.level || "N/A" },
        { l: "RANK", v: `${basic.rank || "Unranked"} (${basic.rankPoints || 0} RP)` },
        { l: "KILLS", v: (basic.totalKills || 0).toLocaleString() },
        { l: "HEADSHOT", v: `${(basic.headshotRate || 0).toFixed(1)}%` }
      ];

      const statsRight = [
        { l: "MATCHES", v: (basic.totalMatches || 0).toLocaleString() },
        { l: "WIN RATE", v: `${winRate}%` },
        { l: "GUILD", v: clan.clanName || "None" },
        { l: "PET", v: profile.petId || "None" }
      ];

      ctx.font = "22px 'Segoe UI'";
      const lx1 = 100, vx1 = 250, lx2 = 550, vx2 = 700, sy = 360, lh = 38;

      // Left Column
      statsLeft.forEach((s, i) => {
        const y = sy + i * lh;
        ctx.fillStyle = "#88ccff"; ctx.textAlign = "left"; ctx.fillText(`${s.l}:`, lx1, y);
        ctx.fillStyle = "#ffffff"; ctx.fillText(s.v, vx1, y);
      });

      // Right Column
      statsRight.forEach((s, i) => {
        const y = sy + i * lh;
        ctx.fillStyle = "#88ccff"; ctx.textAlign = "left"; ctx.fillText(`${s.l}:`, lx2, y);
        ctx.fillStyle = "#ffffff"; ctx.fillText(s.v, vx2, y);
      });

      // === QR Code ===
      const qr = await QRCode.toDataURL(`https://ff.garena.com/profile?uid=${uid}`, { width: 100, color: { dark: "#3399ff" } });
      const qrImg = await loadImage(qr);
      ctx.drawImage(qrImg, 830, 470, 100, 100);
      ctx.fillStyle = "#00ca4e"; ctx.font = "18px 'Segoe UI Bold'"; ctx.textAlign = "center";
      ctx.fillText("SCAN QR", 880, 590);

      // === Taskbar ===
      ctx.fillStyle = "rgba(10,10,20,0.95)"; ctx.fillRect(0, 600, 1000, 100);
      ctx.fillStyle = "#3399ff"; ctx.fillRect(10, 610, 50, 50);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 20px 'Segoe UI Bold'"; ctx.fillText("Start", 70, 645);

      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const date = now.toLocaleDateString('en-GB');
      ctx.fillStyle = "#ffffff"; ctx.font = "18px 'Segoe UI'"; ctx.textAlign = "right";
      ctx.fillText(time, 980, 635); ctx.fillText(date, 980, 660);

      // === Save ===
      const out = path.join(__dirname, '../cache', `ff_${uid}.png`);
      fs.writeFileSync(out, canvas.toBuffer('image/png'));

      await message.reply({ body: "Here is your Free Fire Profile!", attachment: fs.createReadStream(out) });
      await message.reaction("Success", event.messageID);

      setTimeout(() => [cachePic, out].forEach(p => fs.existsSync(p) && fs.unlinkSync(p)), 20000);

    } catch (e) {
      message.reply(`Error: ${e.message}`);
    }
  }
};
