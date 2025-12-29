const { createCanvas, registerFont } = require("canvas");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/* ===== HACKER FONTS ===== */
const fontDir = path.join(__dirname, "fonts");

registerFont(path.join(fontDir, "CourierPrime-Regular.ttf"), {
  family: "Hacker"
});

registerFont(path.join(fontDir, "CourierPrime-Bold.ttf"), {
  family: "Hacker",
  weight: "bold"
});

try {
  registerFont(path.join(fontDir, "NotoColorEmoji.ttf"), {
    family: "Emoji"
  });
} catch {
  console.log("Emoji font not found, using default");
}

/* ===== SYSTEM HELPERS ===== */
let prev = null;
const getCPU = () => {
  let idle = 0, total = 0;
  for (const c of os.cpus()) {
    for (const t in c.times) total += c.times[t];
    idle += c.times.idle;
  }
  const cur = { idle, total };
  if (!prev) { prev = cur; return 0; }
  const di = cur.idle - prev.idle;
  const dt = cur.total - prev.total;
  prev = cur;
  return dt ? Math.round(100 - (100 * di / dt)) : 0;
};

const getDisk = () => {
  try {
    const d = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
    return Math.round((parseInt(d[2]) / parseInt(d[1])) * 100);
  } catch {
    return Math.floor(Math.random() * 30) + 40;
  }
};

const getNetwork = () => {
  try {
    const interfaces = os.networkInterfaces();
    let total = 0;
    for (const iface in interfaces) {
      interfaces[iface].forEach(addr => {
        if (addr.internal === false && addr.family === 'IPv4') {
          total++;
        }
      });
    }
    return total;
  } catch {
    return 3;
  }
};

const getTemperature = () => {
  try {
    if (os.platform() === 'linux') {
      const temp = execSync("cat /sys/class/thermal/thermal_zone0/temp").toString();
      return Math.round(parseInt(temp) / 1000);
    } else if (os.platform() === 'darwin') {
      const temp = execSync("sudo powermetrics --samplers smc -i1 -n1 | grep -i 'CPU die temperature'").toString();
      const match = temp.match(/(\d+\.?\d*)/);
      return match ? Math.round(parseFloat(match[0])) : 45;
    }
  } catch {
    return Math.floor(Math.random() * 20) + 40;
  }
  return 45;
};

module.exports = {
  config: {
    name: "up",
    aliases: ["uptime", "status", "sysinfo"],
    version: "2.3",
    author: "𝙼𝙾𝙷𝙰𝙼𝙼𝙰𝙳 𝙰𝙺𝙰𝚂𝙷",
    role: 0,
    category: "system",
    shortDescription: "Display system status in hacker terminal style"
  },

  onStart: async function ({ message, api, event }) {
    try {
      const start = Date.now();

      // System metrics
      const cpu = Math.min(getCPU(), 99);
      const total = os.totalmem();
      const used = total - os.freemem();
      const ram = Math.min(Math.round((used / total) * 100), 99);
      const disk = Math.min(getDisk(), 99);
      const network = Math.min(getNetwork(), 9);
      const temp = getTemperature();
      const threads = os.cpus().length;
      const platform = os.platform().toUpperCase();
      const arch = os.arch();
      const hostname = os.hostname();
      const load = Math.min(parseFloat(os.loadavg()[0].toFixed(2)), 9.99);

      // Uptime calculation
      const sec = process.uptime();
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const uptime = d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`;

      const ping = Math.min(Date.now() - start, 9999);

      /* ===== TERMINAL STYLE CANVAS ===== */
      const W = 1400, H = 850;
      const cv = createCanvas(W, H);
      const c = cv.getContext("2d");

      // Dark terminal background with gradient
      const gradient = c.createLinearGradient(0, 0, W, H);
      gradient.addColorStop(0, "#0a0a12");
      gradient.addColorStop(1, "#0c0c18");
      c.fillStyle = gradient;
      c.fillRect(0, 0, W, H);

      // Terminal scanlines effect
      for (let i = 0; i < H; i += 3) {
        c.fillStyle = i % 6 === 0 ? "rgba(0, 255, 100, 0.05)" : "rgba(0, 200, 80, 0.02)";
        c.fillRect(0, i, W, 1);
      }

      // Terminal header with glitch effect
      c.font = "bold 56px 'Hacker'";
      c.fillStyle = "#00ff41";
      c.textAlign = "center";
      
      // Glitch effect
      c.fillStyle = "#ff0041";
      c.fillText("█▓▒░ SYSTEM TERMINAL ░▒▓█", W/2 + 2, 82);
      c.fillStyle = "#0041ff";
      c.fillText("█▓▒░ SYSTEM TERMINAL ░▒▓█", W/2 - 2, 78);
      c.fillStyle = "#00ff41";
      c.fillText("█▓▒░ SYSTEM TERMINAL ░▒▓█", W/2, 80);

      // Subtitle
      c.font = "24px 'Hacker'";
      c.fillStyle = "#00cc33";
      c.fillText(">>> REAL-TIME SYSTEM MONITOR v2.3 <<<", W/2, 125);

      // Connection info
      c.font = "18px 'Hacker'";
      c.fillStyle = "#008833";
      c.textAlign = "left";
      c.fillText(`CONNECTED TO: ${hostname.substring(0, 20)}`, 50, 155);
      c.textAlign = "right";
      c.fillText(`SESSION: ${Date.now().toString(16).toUpperCase().substring(0, 12)}`, W - 50, 155);

      // Main content area with border
      c.strokeStyle = "#00ff41";
      c.lineWidth = 2;
      c.strokeRect(40, 170, W - 80, H - 250);

      // Left panel - System Info
      c.font = "bold 36px 'Hacker'";
      c.fillStyle = "#00ff88";
      c.textAlign = "left";
      c.fillText("> SYSTEM SPECIFICATIONS", 60, 220);

      const sysInfo = [
        `OS: ${platform.substring(0, 10)} ${arch}`,
        `CPU CORES: ${threads} @ ${os.cpus()[0].model.split('@')[0].substring(0, 30)}`,
        `NETWORK: ${network} ACTIVE INTERFACES`,
        `NODE: ${process.version.substring(0, 15)}`,
        `LOAD: ${load}`,
        `TEMP: ${temp}°C`
      ];

      c.font = "28px 'Hacker'";
      c.fillStyle = "#00ee77";
      const lineHeight = 45;
      sysInfo.forEach((info, i) => {
        c.fillText(`◉ ${info}`, 80, 280 + (i * lineHeight));
      });

      // Right panel - Live Metrics
      c.font = "bold 36px 'Hacker'";
      c.fillStyle = "#00ff88";
      c.textAlign = "left";
      c.fillText("> LIVE METRICS", W/2 + 60, 220);

      // ASCII art bars
      const drawTerminalBar = (x, y, value, label, color, symbol = "█") => {
        c.font = "26px 'Hacker'";
        c.fillStyle = "#00cc66";
        c.fillText(label, x, y);
        
        c.fillStyle = "#002200";
        c.fillRect(x, y + 15, 400, 30);
        
        const fillWidth = (value / 100) * 400;
        const barGradient = c.createLinearGradient(x, 0, x + fillWidth, 0);
        barGradient.addColorStop(0, color);
        barGradient.addColorStop(1, color + "cc");
        c.fillStyle = barGradient;
        c.fillRect(x, y + 15, fillWidth, 30);
        
        c.strokeStyle = "#00ff41";
        c.lineWidth = 1;
        c.strokeRect(x, y + 15, 400, 30);
        
        c.font = "bold 24px 'Hacker'";
        c.fillStyle = "#ffffff";
        c.textAlign = "right";
        const symbols = symbol.repeat(Math.floor(value/20));
        c.fillText(`${value}% ${symbols.substring(0, 5)}`, x + 395, y + 40);
        c.textAlign = "left";
      };

      drawTerminalBar(W/2 + 60, 280, cpu, "CPU LOAD", "#00ff41", "■");
      drawTerminalBar(W/2 + 60, 350, ram, "MEMORY USAGE", "#00ccff", "▣");
      drawTerminalBar(W/2 + 60, 420, disk, "STORAGE USAGE", "#ff00ff", "◼");

      // Status indicators
      c.font = "bold 32px 'Hacker'";
      c.fillStyle = "#ffff00";
      c.textAlign = "left";
      c.fillText("⌛ SYSTEM UPTIME:", 60, 550);
      
      c.font = "30px 'Hacker'";
      c.fillStyle = "#00ffff";
      c.fillText(`[ ${uptime} ]`, 400, 550);

      c.font = "bold 32px 'Hacker'";
      c.fillStyle = "#ffff00";
      c.fillText("📡 RESPONSE TIME:", 60, 610);
      
      let pingColor = "#00ff00";
      let pingStatus = "EXCELLENT";
      if (ping > 200) {
        pingColor = "#ffff00";
        pingStatus = "GOOD";
      }
      if (ping > 500) {
        pingColor = "#ff5500";
        pingStatus = "SLOW";
      }
      if (ping > 1000) {
        pingColor = "#ff0000";
        pingStatus = "POOR";
      }
      
      c.font = "30px 'Hacker'";
      c.fillStyle = pingColor;
      c.fillText(`[ ${ping}ms | ${pingStatus} ]`, 430, 610);

      // Process info
      c.font = "bold 32px 'Hacker'";
      c.fillStyle = "#ffff00";
      c.fillText("🖥️  ACTIVE PROCESSES:", 60, 670);
      
      c.font = "28px 'Hacker'";
      c.fillStyle = "#ff55ff";
      const moduleCount = Math.min(Object.keys(global).length, 999);
      c.fillText(`${moduleCount} MODULES LOADED`, 480, 670);

      // Horizontal separator line
      c.strokeStyle = "#00ff41";
      c.lineWidth = 1;
      c.setLineDash([5, 3]);
      c.beginPath();
      c.moveTo(60, 720);
      c.lineTo(W - 60, 720);
      c.stroke();
      c.setLineDash([]);

      // Terminal footer
      c.font = "22px 'Hacker'";
      c.fillStyle = "#00ff41";
      c.textAlign = "center";
      
      const blink = Math.floor(Date.now() / 500) % 2 === 0;
      c.fillText(blink ? "▋" : "_", W/2, H - 70);

      // Status message
      const status = ping < 100 ? "OPTIMAL" : ping < 300 ? "STABLE" : "LAG DETECTED";
      const statusColor = ping < 100 ? "#00ff00" : ping < 300 ? "#ffff00" : "#ff0000";
      
      c.font = "bold 30px 'Hacker'";
      c.fillStyle = statusColor;
      c.fillText(`<<< SYSTEM STATUS: ${status} >>>`, W/2, H - 120);

      // Bottom hex stream
      c.font = "20px 'Hacker'";
      c.fillStyle = "#008833";
      for (let i = 0; i < W; i += 180) {
        const hex = Math.random().toString(16).substr(2, 6).toUpperCase();
        c.fillText(`0x${hex}`, i + 40, H - 40);
      }

      // Binary rain in background
      c.font = "18px 'Hacker'";
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const binary = Math.random() > 0.5 ? "1" : "0";
        const alpha = Math.random() * 0.2 + 0.05;
        c.fillStyle = `rgba(0, 255, 100, ${alpha})`;
        c.fillText(binary, x, y);
      }

      // Save image
      const timestamp = Date.now();
      const file = path.join(__dirname, "cache", `terminal_${timestamp}.png`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, cv.toBuffer());

      // Send ONLY the image attachment WITHOUT any message body
      await message.reply({
        attachment: fs.createReadStream(file)
      });

      // Auto-cleanup
      setTimeout(() => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }, 15000);

    } catch (error) {
      console.error("TERMINAL ERROR:", error);
      // Send error message without ASCII art box
      message.reply("❌ System terminal failed to generate.");
    }
  },

  onChat: async function({ event, api }) {
    if (event.body && event.body.toLowerCase() === "hack") {
      api.sendMessage("```ACCESS DENIED\nINSUFFICIENT PRIVILEGES\n>_```", event.threadID);
    }
  }
};
