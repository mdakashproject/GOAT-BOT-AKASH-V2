const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json?fbclid=IwY2xjawN1LPlleHRuA2FlbQIxMQABHrS3c9PLQEj8--h_gtg-Dn1chJA1PuOg39Bl3_7volMObgoBTusScj7atlSv_aem_Od2q66hLLFpjGWb1_EWUhw`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "video",
    version: "1.0.0",
    author: "RX x MOHAMMAD AKASH",
    role: 0,
    category: "media",
    shortDescription: "Download video from YouTube",
    longDescription: "Search YouTube videos and download them in MP4 format.",
    guide: "{pn} [video name | YouTube link]\n\nExample:\n{pn} despacito"
  },

  onStart: async function ({ api, event, args }) {
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const input = args.join(" ");

    if (!input)
      return api.sendMessage("❌ Please provide a video name or YouTube link.", event.threadID, event.messageID);

    const isYtLink = checkurl.test(input);
    const tmpFolder = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder, { recursive: true });

    // Direct YouTube link
    if (isYtLink) {
      const match = input.match(checkurl);
      const videoID = match ? match[1] : null;

      try {
        const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp4`);
        const { title, downloadLink } = data;

        const filePath = path.join(tmpFolder, `${Date.now()}_video.mp4`);
        const res = await axios.get(downloadLink, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data));

        return api.sendMessage(
          { body: `🎬 ${title}`, attachment: fs.createReadStream(filePath) },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to fetch video.", event.threadID, event.messageID);
      }
    }

    // Keyword search
    let keyWord = input.includes("?feature=share")
      ? input.replace("?feature=share", "")
      : input;
    const maxResults = 6;

    try {
      const res = await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`);
      const results = res.data.slice(0, maxResults);

      if (!results.length)
        return api.sendMessage(`⭕ No results found for: ${keyWord}`, event.threadID, event.messageID);

      let msg = "🎥 Choose a video below (reply with number 1–6):\n\n";
      const thumbs = [];

      results.forEach((info, i) => {
        msg += `${i + 1}. ${info.title}\n⏱️ ${info.time}\n📺 ${info.channel.name}\n\n`;
        thumbs.push(loadStream(info.thumbnail));
      });

      const allThumbs = await Promise.all(thumbs);

      return api.sendMessage(
        {
          body: msg + "🎬 Reply with the number to download the video.",
          attachment: allThumbs
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "video",
            author: event.senderID,
            results,
            messageID: info.messageID
          });
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error searching for videos.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;
    const { results, messageID } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice < 1 || choice > results.length)
      return api.sendMessage("❌ Please reply with a valid number.", event.threadID, event.messageID);

    const selected = results[choice - 1];
    const tmpFolder = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder, { recursive: true });

    try {
      // Unsend old message
      api.unsendMessage(messageID);

      const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${selected.id}&format=mp4`);
      const { title, quality, downloadLink } = data;

      const filePath = path.join(tmpFolder, `${Date.now()}_video.mp4`);
      const res = await axios.get(downloadLink, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      return api.sendMessage(
        {
          body: `🎬 Now Playing: ${title}\n📦 Quality: ${quality}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("⭕ Error downloading video (may exceed 26MB).", event.threadID, event.messageID);
    }
  }
};

// Helper to stream thumbnails
async function loadStream(url) {
  try {
    const res = await axios.get(url, { responseType: "stream" });
    return res.data;
  } catch {
    return null;
  }
}
