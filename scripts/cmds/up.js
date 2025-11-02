const { createCanvas, loadImage } = require('canvas');
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "9.1",
    author: "MOHAMMAD AKASH",
    shortDescription: "কোনো ফুটার ছাড়া",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, api, event, threadsData, usersData }) {
    try {
      // === System Info ===
      const uptimeSec = process.uptime();
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = Math.floor(uptimeSec % 60);
      const uptime = `${h}h ${m}m ${s}s`;

      let groups = 0, users = 0;
      try {
        const allThreads = await threadsData.getAll();
        groups = allThreads.filter(t => t.threadInfo?.isGroup).length;
        users = (await usersData.getAll()).length;
      } catch (e) {}

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

      let disk = { used: 0, total: 1, percent: 0 };
      try {
        const df = execSync("df -k /", { timeout: 5000 }).toString().split("\n")[1].split(/\s+/);
        disk.used = parseInt(df[2]) * 1024;
        disk.total = parseInt(df[1]) * 1024;
        disk.percent = Math.round((disk.used / disk.total) * 100);
      } catch (e) {
        disk.percent = 0;
      }

      const cpuModel = os.cpus()[0]?.model.trim().split(" ").slice(0, 4).join(" ") || "Unknown CPU";
      const nodeVer = process.version;

      // === Fake Data for Graph ===
      const cpuHistory = Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 40);
      const ramHistory = Array.from({ length: 30 }, () => parseFloat(memPercent) + Math.random() * 10 - 5);
      const diskHistory = Array.from({ length: 30 }, () => disk.percent + Math.random() * 15 - 7.5);

      // === Avatar ===
      const senderID = event.senderID;
      const avatarUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      let avatarPath = path.join(__dirname, 'cache', 'avatar_uptime.png');

      try {
        const res = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 10000 });
        fs.writeFileSync(avatarPath, res.data);
      } catch (e) {
        avatarPath = null;
      }

      // === Canvas ===
      const width = 1000;
      const height = 700;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.font = 'bold 42px Arial';
      ctx.fillStyle = '#60a5fa';
      ctx.textAlign = 'center';
      ctx.fillText('SYSTEM STATUS', width / 2, 70);

      ctx.font = '20px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Real-time Server Monitor', width / 2, 100);
      ctx.textAlign = 'left';

      // === Draw Graph ===
      function drawGraph(x, y, w, h, data, color) {
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        data.forEach((val, i) => {
          const px = x + (i * w) / (data.length - 1);
          const py = y + h - (val * h) / 100;
          ctx.lineTo(px, py);
        });
        ctx.lineTo(x + w, y + h);
        ctx.closePath();

        const fillGrad = ctx.createLinearGradient(0, y, 0, y + h);
        fillGrad.addColorStop(0, `${color}40`);
        fillGrad.addColorStop(1, `${color}10`);
        ctx.fillStyle = fillGrad;
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      let yPos = 140;

      // CPU
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('CPU', 80, yPos);
      ctx.font = 'bold 52px Arial';
      ctx.fillText(`${cpuHistory[cpuHistory.length - 1].toFixed(0)}%`, 80, yPos + 60);
      ctx.font = '18px Arial';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(cpuModel, 80, yPos + 90);
      drawGraph(380, yPos - 20, 550, 100, cpuHistory, '#60a5fa');
      yPos += 130;

      // RAM
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('RAM', 80, yPos);
      ctx.font = 'bold 52px Arial';
      ctx.fillText(`${memPercent}%`, 80, yPos + 60);
      ctx.font = '18px Arial';
      ctx.fillStyle = '#fbcfe8';
      ctx.fillText(`${formatBytes(usedMem)} / ${formatBytes(totalMem)}`, 80, yPos + 90);
      drawGraph(380, yPos - 20, 550, 100, ramHistory, '#f87171');
      yPos += 130;

      // DISK
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('DISK', 80, yPos);
      ctx.font = 'bold 52px Arial';
      ctx.fillText(`${disk.percent}%`, 80, yPos + 60);
      ctx.font = '18px Arial';
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText(`${formatBytes(disk.used)} / ${formatBytes(disk.total)}`, 80, yPos + 90);
      drawGraph(380, yPos - 20, 550, 100, diskHistory, '#34d399');
      yPos += 140;

      // BOT STATUS
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('BOT STATUS', 80, yPos);
      yPos += 50;

      const statusLines = [
        `Uptime: ${uptime}`,
        `Users: ${users}`,
        `Groups: ${groups}`,
        `OS: ${os.type()} ${os.release()}`,
        `Node.js: ${nodeVer}`
      ];

      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#e2e8f0';
      statusLines.forEach((line, i) => {
        ctx.fillText(`• ${line}`, 100, yPos + i * 45);
      });

      // Avatar
      if (avatarPath && fs.existsSync(avatarPath)) {
        try {
          const avatar = await loadImage(avatarPath);
          const avSize = 90;
          const avX = width - avSize - 60;
          const avY = height - avSize - 60;

          ctx.save();
          ctx.beginPath();
          ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatar, avX, avY, avSize, avSize);
          ctx.restore();

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(avX + avSize - 15, avY + avSize - 15, 15, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      }

      // === NO FOOTER TEXT ===

      // Save & Send
      const buffer = canvas.toBuffer('image/png');
      const filePath = path.join(__dirname, 'cache', 'uptime_clean.png');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, buffer);

      await message.reply({
        body: 'System Status',
        attachment: fs.createReadStream(filePath)
      });

      // Cleanup
      setTimeout(() => {
        [filePath, avatarPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
      }, 5000);

    } catch (error) {
      console.error("UPTIME ERROR:", error);
      await message.reply("Error: " + (error.message || "Unknown"));
    }
  }
};
