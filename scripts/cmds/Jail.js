const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "jail",
    version: "1.0",
    author: "MOHAMMAD AKASH",
    countDown: 5,
    role: 0,
    shortDescription: "Put someone in jail",
    longDescription: "Mention a user to lock them behind bars.",
    category: "fun",
    guide: { en: "{pn} @mention" }
  },

  onStart: async function ({ event, message, api }) {
    try {
      const mentionID = Object.keys(event.mentions)[0];
      if (!mentionID) return message.reply("Mention someone to jail!");

      // Get real profile picture using GoatBot API
      const userInfo = await api.getUserInfo(mentionID);
      const photoUrl = userInfo[mentionID].thumbSrc || 
                      `https://graph.facebook.com/${mentionID}/picture?width=512&height=512`;

      // Download photo
      const res = await axios.get(photoUrl, { responseType: "arraybuffer" });
      const avatarPath = __dirname + "/cache/jail_avatar.jpg";
      const outputPath = __dirname + "/cache/jail_card.jpg";

      fs.writeFileSync(avatarPath, Buffer.from(res.data));

      // Canvas
      const canvas = createCanvas(700, 500);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#2c3e50";
      ctx.fillRect(0, 0, 700, 500);

      // Title
      ctx.font = "bold 70px Arial";
      ctx.fillStyle = "#e74c3c";
      ctx.textAlign = "center";
      ctx.fillText("WANTED", 350, 80);

      // Load avatar
      const avatar = await loadImage(avatarPath);

      // Draw avatar in circle
      const centerX = 350, centerY = 250, radius = 130;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();

      // Jail bars (vertical lines)
      ctx.lineWidth = 12;
      ctx.strokeStyle = "#000";
      ctx.lineCap = "round";

      const barCount = 7;
      const spacing = 700 / (barCount + 1);
      for (let i = 1; i <= barCount; i++) {
        const x = i * spacing;
        ctx.beginPath();
        ctx.moveTo(x, 100);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }

      // Horizontal bar on top and bottom
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(80, 130);
      ctx.lineTo(620, 130);
      ctx.moveTo(80, 370);
      ctx.lineTo(620, 370);
      ctx.stroke();

      // Caption
      ctx.font = "italic 28px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText("Locked Up!", 350, 450);

      // Save image
      fs.writeFileSync(outputPath, canvas.toBuffer("image/jpeg"));

      // Send
      await message.reply({
        body: `JAIL TIME!\n"Locked Up!"`,
        attachment: fs.createReadStream(outputPath)
      });

      // Cleanup
      [avatarPath, outputPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));

    } catch (err) {
      console.error("Jail Error:", err);
      message.reply("Error! Try again.");
    }
  }
};
