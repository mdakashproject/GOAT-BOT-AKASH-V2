const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const TIKTOK_SEARCH_API = "https://lyric-search-neon.vercel.app/kshitiz?keyword=";
const CACHE_DIR = path.join(__dirname, "tiktok_cache");

async function getStream(url) {
  const res = await axios({
    url,
    responseType: "stream",
    timeout: 180000
  });
  return res.data;
}

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt"],
    version: "1.0.0",
    author: "Newaz x Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
    countDown: 5,
    role: 0,
    description: {
      en: "Search & Download TikTok Video"
    },
    category: "media",
    guide: {
      en: "{pn} <keyword>"
    }
  },

  onStart: async function ({ api, event, args, commandName }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "❌ 𝐒ᴇᴀʀᴄʜ 𝐊ᴇʏᴡᴏʀᴅ 𝐃ᴀᴏ!",
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage(
      `🔎 𝐒ᴇᴀʀᴄʜɪɴɢ 𝐓ɪᴋᴛᴏᴋ...\n🔍 𝐊ᴇʏᴡᴏʀᴅ: ❝ ${query} ❞`,
      event.threadID,
      event.messageID
    );

    try {
      const res = await axios.get(
        TIKTOK_SEARCH_API + encodeURIComponent(query),
        { timeout: 20000 }
      );

      const results = res.data.slice(0, 6);
      if (!results.length) {
        return api.sendMessage(
          "❌ 𝐍ᴏ 𝐕ɪᴅᴇᴏ 𝐅ᴏᴜɴᴅ!\n🔁 𝐀ɴᴏᴛʜᴇʀ 𝐊ᴇʏᴡᴏʀᴅ 𝐓ʀʏ 𝐊ᴏʀᴏ",
          event.threadID,
          event.messageID
        );
      }

      let body = "✨ 𝐓ɪᴋᴛᴏᴋ 𝐒ᴇᴀʀᴄʜ 𝐑ᴇsᴜʟᴛs ✨\n\n";
      const thumbs = [];

      results.forEach((v, i) => {
        body += `${i + 1}️⃣ 𝐓ɪᴛʟᴇ:\n➤ ${v.title.substring(0, 60)}\n`;
        body += `👤 𝐂ʀᴇᴀᴛᴏʀ: @${v.author.unique_id}\n`;
        body += `⏱️ 𝐃ᴜʀᴀᴛɪᴏɴ: ${v.duration}s\n\n━━━━━━━━━━━━━━━\n\n`;
        if (v.cover) thumbs.push(getStream(v.cover));
      });

      body += `📥 𝐑ᴇᴘʟʏ 𝐖ɪᴛʜ 𝐍ᴜᴍʙᴇʀ (1-${results.length})\n🎬 𝐓ᴏ 𝐃ᴏᴡɴʟᴏᴀᴅ`;

      const attachments = await Promise.all(thumbs);

      api.sendMessage(
        { body, attachment: attachments },
        event.threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              author: event.senderID,
              results
            });
          }
        },
        event.messageID
      );
    } catch (e) {
      api.sendMessage(
        "❌ 𝐓ɪᴋᴛᴏᴋ 𝐀ᴘɪ 𝐄ʀʀᴏʀ!",
        event.threadID,
        event.messageID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const num = parseInt(event.body);
    const { results } = Reply;

    if (isNaN(num) || num < 1 || num > results.length) {
      return api.sendMessage(
        `❌ 𝐈ɴᴠᴀʟɪᴅ 𝐍ᴜᴍʙᴇʀ!\n✅ 1 - ${results.length} 𝐄ʀ 𝐌ᴏᴅᴅʜᴇ 𝐃ᴀᴏ`,
        event.threadID,
        event.messageID
      );
    }

    const video = results[num - 1];
    await api.unsendMessage(Reply.messageID);

    await fs.ensureDir(CACHE_DIR);
    const name = video.title.substring(0, 25).replace(/[^a-z0-9]/gi, "_");
    const file = path.join(CACHE_DIR, `${Date.now()}_${name}.mp4`);

    api.sendMessage(
      `⏳ 𝐃ᴏᴡɴʟᴏᴀᴅɪɴɢ...\n🎬 ${video.title}`,
      event.threadID
    );

    try {
      const res = await axios({
        url: video.videoUrl,
        responseType: "stream",
        timeout: 300000
      });

      const writer = fs.createWriteStream(file);
      res.data.pipe(writer);

      await new Promise((r, e) => {
        writer.on("finish", r);
        writer.on("error", e);
      });

      api.sendMessage(
        {
          body:
            `✅ 𝐃ᴏᴡɴʟᴏᴀᴅ 𝐂ᴏᴍᴘʟᴇᴛᴇᴅ!\n\n` +
            `🎥 𝐓ɪᴛʟᴇ: ${video.title}\n` +
            `👤 𝐂ʀᴇᴀᴛᴏʀ: @${video.author.unique_id}\n` +
            `⏱️ 𝐃ᴜʀᴀᴛɪᴏɴ: ${video.duration}s\n\n✨ 𝐄ɴᴊᴏʏ ✨`,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file),
        event.messageID
      );
    } catch (err) {
      api.sendMessage(
        "❌ 𝐃ᴏᴡɴʟᴏᴀᴅ 𝐅ᴀɪʟᴇᴅ!",
        event.threadID,
        event.messageID
      );
    }
  }
};
