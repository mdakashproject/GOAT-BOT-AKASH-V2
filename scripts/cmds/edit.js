const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    aliases: ["nanobanana"],
    version: "1.0.4",
    author: "CYBER ULLASH",
    countDown: 30,
    role: 0,
    shortDescription: "Edit image using NanoBanana API",
    category: "AI",
    guide: {
      en: "{pn} <text> (reply to an image)",
    },
  },

  onStart: async function ({ message, event, args, api }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐬𝐨𝐦𝐞 𝐭𝐞𝐱𝐭 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐢𝐦𝐚𝐠𝐞.");

    api.setMessageReaction("☣️", event.messageID, () => {}, true);

    try {
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        !event.messageReply.attachments[0] ||
        !event.messageReply.attachments[0].url
      ) {
        api.setMessageReaction("⚠️", event.messageID, () => {}, true);
        return message.reply("⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞.");
      }

      const imgUrl = event.messageReply.attachments[0].url;

      const requestURL = `https://mahbub-ullash.cyberbot.top/api/nano-banana?prompt=${encodeURIComponent(
        prompt
      )}&imageUrl=${encodeURIComponent(imgUrl)}`;

      const res = await axios.get(requestURL);

      if (!res.data || res.data.status !== true || !res.data.image) {
        api.setMessageReaction("⚠️", event.messageID, () => {}, true);
        return message.reply("❌ 𝐀𝐏𝐈 𝐄𝐫𝐫𝐨𝐫: 𝐈𝐦𝐚𝐠𝐞 𝐝𝐚𝐭𝐚 𝐧𝐨𝐭 𝐫𝐞𝐜𝐞𝐢𝐯𝐞𝐝.");
      }

      const finalImageURL = res.data.image;

      const imageData = await axios.get(finalImageURL, { responseType: "arraybuffer" });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(imageData.data));

      api.setMessageReaction("☢️", event.messageID, () => {}, true);

      await message.reply(
        {
          body: `✅ 𝐈𝐦𝐚𝐠𝐞 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n👤 Operator: ${res.data.operator || "Unknown"}`,
          attachment: fs.createReadStream(filePath),
        },
        () => {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {}
        }
      );
    } catch (err) {
      console.log("❌ 𝐄𝐑𝐑𝐎𝐑:", err?.response?.data || err.message || err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ 𝐄𝐫𝐫𝐨𝐫 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐭𝐡𝐞 𝐢𝐦𝐚𝐠𝐞.");
    }
  },
};
