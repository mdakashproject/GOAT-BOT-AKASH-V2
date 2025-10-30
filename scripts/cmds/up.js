const os = require("os");
const { execSync } = require("child_process");

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.3",
    author: "MOHAMMAD AKASH",
    shortDescription: "Show bot status & uptime",
    longDescription: "Displays uptime, system specs and resource usage in stylish format.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, threadsData, usersData }) {
    try {
      const uptimeSec = process.uptime();
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = Math.floor(uptimeSec % 60);
      const uptime = `${hours}H ${minutes}M ${seconds}S`;

      const threads = await threadsData.getAll();
      const groups = threads.filter(t => t.threadInfo?.isGroup).length;
      const users = (await usersData.getAll()).length;

      const totalMem = os.totalmem();
      const usedMem = totalMem - os.freemem();
      const memUsage = (usedMem / totalMem) * 100;

      const memBar = "█".repeat(Math.round(memUsage / 10)) + "▒".repeat(10 - Math.round(memUsage / 10));
      const ramBar = "█".repeat(Math.round(usedMem / totalMem * 10)) + "▒".repeat(10 - Math.round(usedMem / totalMem * 10));

      let disk = { used: 0, total: 1, bar: "▒▒▒▒▒▒▒▒▒▒" };
      try {
        const df = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
        const used = parseInt(df[2]) * 1024;
        const total = parseInt(df[1]) * 1024;
        const percent = Math.round((used / total) * 100);
        const bar = "█".repeat(Math.floor(percent / 10)) + "▒".repeat(10 - Math.floor(percent / 10));
        disk = { used, total, bar };
      } catch (e) {}

      const msg =
`🌟 𝗕𝗼𝘁 𝗦𝘁𝗮𝘁𝘂𝘀 🌟
────────────────────
⏱ 𝘜𝘱𝘵𝘪𝘮𝘦      : ${uptime}
👥 𝘜𝘴𝘦𝘳𝘴      : ${users}
👪 𝘎𝘳𝘰𝘶𝘱𝘴     : ${groups}
────────────────────
💻 𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼
OS           : ${os.type().toLowerCase()} ${os.release()}
CPU Model    : ${os.cpus()[0]?.model || "Unknown Processor"}
Cores        : ${os.cpus().length}
Architecture : ${os.arch()}
────────────────────
🗄 𝗗𝗶𝘀𝗸
Usage        : ${disk.bar} ${Math.round((disk.used/disk.total)*100)}%
Used         : ${formatBytes(disk.used)}
Total        : ${formatBytes(disk.total)}
────────────────────
💾 𝗠𝗲𝗺𝗼𝗿𝘆
Usage        : ${memBar} ${Math.round(memUsage)}%
Used         : ${formatBytes(usedMem)}
Total        : ${formatBytes(totalMem)}
────────────────────
📊 𝗥𝗔𝗠
Usage        : ${ramBar} ${Math.round((usedMem/totalMem)*100)}%
Used         : ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB
Total        : ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB
────────────────────
✨ 𝗕𝗼𝘁 𝗶𝘀 𝗿𝘂𝗻𝗻𝗶𝗻𝗴 𝘀𝗺𝗼𝗼𝘁𝗵𝗹𝘆! ✨`;

      message.reply(msg);
    } catch (err) {
      console.error(err);
      message.reply("❌ | Uptime command failed.");
    }
  }
};
