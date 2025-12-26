const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = "https://cron-video.onrender.com";

module.exports = {
  config: {
    name: "xnxx",
    version: "1.0.0",
    author: "RX x MOHAMMAD AKASH",
    role: 1,
    category: "18+",
    shortDescription: "Search and download videos from adult API",
    longDescription: "Search videos and download them in MP4 format from xnxx API",
    guide: "{pn} [video name]\n\nExample:\n{pn} Sunny Leone"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ");
    if (!input)
      return api.sendMessage("❌ Please provide a search term.", event.threadID, event.messageID);

    try {
      const res = await axios.get(`${baseApiUrl}/?q=${encodeURIComponent(input)}`);
      const results = res.data.videos.slice(0, 6);

      if (!results.length)
        return api.sendMessage(`⭕ No videos found for: ${input}`, event.threadID, event.messageID);

      let msg = "🎥 Cʜᴏᴏsᴇ ᴀ ᴠɪᴅᴇᴏ ʙᴇʟᴏᴡ (ʀᴇᴘʟʏ ᴡɪᴛʜ ɴᴜᴍʙᴇʀ 1–6)\n\n";
      results.forEach((video, i) => {
        msg += `🔹 ${i + 1}. ${video.title}\n⏱️ ${video.quality || "N/A"}\n📺 ${video.videoPage}\n\n`;
      });
      msg += "🎶 Reply with the number to download the video.";

      return api.sendMessage(
        { body: msg },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "xnxx",
            author: event.senderID,
            results,
            messageID: info.messageID
          });
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error fetching videos.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    const { results, messageID } = Reply;

    if (isNaN(choice) || choice < 1 || choice > results.length)
      return api.sendMessage("❌ Please reply with a valid number.", event.threadID, event.messageID);

    const selected = results[choice - 1];
    const tmpFolder = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder, { recursive: true });

    try {
      api.unsendMessage(messageID);

      if (!selected.directMp4Url) 
        return api.sendMessage("❌ Video unavailable for download.", event.threadID, event.messageID);

      const filePath = path.join(tmpFolder, `${Date.now()}_video.mp4`);
      const res = await axios.get(selected.directMp4Url, { responseType: "arraybuffer" });

      if (res.data.length / (1024 * 1024) > 26)
        return api.sendMessage("❌ Video size exceeds 26MB limit.", event.threadID, event.messageID);

      fs.writeFileSync(filePath, Buffer.from(res.data));

      return api.sendMessage(
        { body: `🎬 ${selected.title}\n📦 Quality: ${selected.quality || "N/A"}`, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to download video.", event.threadID, event.messageID);
    }
  }
};
