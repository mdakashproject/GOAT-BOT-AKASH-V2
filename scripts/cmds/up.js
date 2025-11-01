const { createCanvas, loadImage } = require('canvas');
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function drawGraph(ctx, x, y, w, h, data, color) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  data.forEach((val, i) => {
    const px = x + (i * w) / (data.length - 1);
    const py = y + h - (val * h) / 100;
    ctx.lineTo(px, py);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, `${color}40`);
  gradient.addColorStop(1, `${color}10`);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.fillStyle = gradient;
  ctx.fill();
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "5.0",
    author: "MOHAMMAD AKASH 😘",
    shortDescription: "Task Manager + Your Profile Pic",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, api, event, threadsData, usersData }) {
    try {
      // === Bot Data ===
      const uptimeSec = process.uptime();
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = Math.floor(uptimeSec % 60);
      const uptime = `${h}h ${m}m ${s}s`;

      const threads = await threadsData.getAll();
      const groups = threads.filter(t => t.threadInfo?.isGroup).length;
      const users = (await usersData.getAll()).length;

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

      let disk = { used: 0, total: 1, percent: 0 };
      try {
        const df = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
        disk.used = parseInt(df[2]) * 1024;
        disk.total = parseInt(df[1]) * 1024;
        disk.percent = Math.round((disk.used / disk.total) * 100);
      } catch (e) {}

      const cpuModel = os.cpus()[0]?.model.trim().split(' ').slice(0, 5).join(' ') || 'CPU';

      // Simulate history
      const cpuHistory = Array.from({ length: 30 }, () => Math.floor(Math.random() * 40) + 30);
      const ramHistory = Array.from({ length: 30 }, () => parseFloat(memPercent) + Math.random() * 5 - 2.5);
      const diskHistory = Array.from({ length: 30 }, () => disk.percent + Math.random() * 10 - 5);

      // === Get Your Profile Picture ===
      const senderID = event.senderID;
      let profilePicUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      let avatarPath = path.join(__dirname, 'cache', 'avatar.png');

      try {
        const response = await axios({
          url: profilePicUrl,
          method: 'GET',
          responseType: 'arraybuffer'
        });
        fs.writeFileSync(avatarPath, response.data);
      } catch (e) {
        console.error("Failed to download profile pic:", e.message);
        avatarPath = null;
      }

      // === Canvas ===
      const width = 900;
      const height = 680;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, width, height);

      // Title Bar
      ctx.fillStyle = '#2d2d2d';
      roundRect(ctx, 0, 0, width, 50, 0, true);
      ctx.fillStyle = '#0078d4';
      ctx.fillRect(0, 0, 5, 50);

      // Title
      ctx.font = 'bold 18px "Segoe UI"';
      ctx.fillStyle = '#fff';
      ctx.fillText('Task Manager', 15, 32);

      // Tabs
      const tabs = ['Processes', 'Performance', 'App history', 'Startup', 'Users', 'Details', 'Services'];
      tabs.forEach((tab, i) => {
        const x = 200 + i * 90;
        ctx.fillStyle = i === 1 ? '#0078d4' : '#2d2d2d';
        roundRect(ctx, x, 10, 80, 30, 4, true);
        ctx.fillStyle = '#fff';
        ctx.font = '14px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(tab, x + 40, 30);
      });
      ctx.textAlign = 'left';

      let y = 70;

      // CPU
      ctx.fillStyle = '#00bcf2';
      ctx.fillText('CPU', 40, y);
      ctx.font = 'bold 36px "Segoe UI"';
      ctx.fillText(`${cpuHistory[cpuHistory.length-1].toFixed(0)}%`, 40, y + 50);
      ctx.font = '14px "Segoe UI"';
      ctx.fillStyle = '#aaa';
      ctx.fillText(cpuModel, 40, y + 75);
      drawGraph(ctx, 300, y - 20, 560, 90, cpuHistory, '#00bcf2');
      y += 110;

      // Memory
      ctx.fillStyle = '#ff9800';
      ctx.fillText('Memory', 40, y);
      ctx.font = 'bold 36px "Segoe UI"';
      ctx.fillText(`${memPercent}%`, 40, y + 50);
      ctx.font = '14px "Segoe UI"';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${formatBytes(usedMem)} / ${formatBytes(totalMem)}`, 40, y + 75);
      drawGraph(ctx, 300, y - 20, 560, 90, ramHistory, '#ff9800');
      y += 110;

      // Disk
      ctx.fillStyle = '#e91e63';
      ctx.fillText('Disk (/)', 40, y);
      ctx.font = 'bold 36px "Segoe UI"';
      ctx.fillText(`${disk.percent}%`, 40, y + 50);
      ctx.font = '14px "Segoe UI"';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${formatBytes(disk.used)} / ${formatBytes(disk.total)}`, 40, y + 75);
      drawGraph(ctx, 300, y - 20, 560, 90, diskHistory, '#e91e63');
      y += 130;

      // Bot Info
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 20px "Segoe UI"';
      ctx.fillText('Bot Status', 40, y);
      y += 30;

      const info = [
        `Uptime: ${uptime}`,
        `Users: ${users.toLocaleString()}`,
        `Groups: ${groups.toLocaleString()}`,
        `OS: ${os.type()} ${os.release()}`,
        `Node.js: ${process.version}`
      ];

      ctx.font = '16px "Segoe UI"';
      ctx.fillStyle = '#ccc';
      info.forEach((line, i) => {
        ctx.fillText(`• ${line}`, 60, y + i * 25);
      });

      // === Profile Picture in Bottom Right ===
      if (avatarPath && fs.existsSync(avatarPath)) {
        try {
          const avatar = await loadImage(avatarPath);
          const size = 60;
          const x = width - size - 30;
          const yPos = height - size - 80;

          // Shadow
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;

          // Circle clip
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + size / 2, yPos + size / 2, size / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatar, x, yPos, size, size);
          ctx.restore();

          // Online indicator
          ctx.fillStyle = '#4caf50';
          ctx.beginPath();
          ctx.arc(x + size - 10, yPos + size - 10, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Reset shadow
          ctx.shadowColor = 'transparent';
        } catch (e) {
          console.error("Failed to draw avatar:", e);
        }
      }

      // Footer
      ctx.fillStyle = '#2d2d2d';
      ctx.fillRect(0, height - 40, width, 40);
      ctx.fillStyle = '#888';
      ctx.font = '12px "Segoe UI"';
      ctx.fillText(`Goat-Bot-V2 • ${new Date().toLocaleString()}`, 15, height - 15);

      // Save
      const buffer = canvas.toBuffer('image/png');
      const filePath = path.join(__dirname, 'cache', 'task_manager_profile.png');
      if (!fs.existsSync(path.join(__dirname, 'cache'))) {
        fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);

      await message.reply({
        body: "",
        attachment: fs.createReadStream(filePath)
      });

      // Cleanup
      setTimeout(() => {
        [filePath, avatarPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
      }, 5000);

    } catch (err) {
      console.error(err);
      message.reply("Failed to generate card with profile picture.");
    }
  }
};

function roundRect(ctx, x, y, w, h, r, fill = false, stroke = false) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
