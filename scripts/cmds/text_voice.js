const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "text_voice",
    version: "1.0.0",
    author: "Sᴀʜᴜ x Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
    countDown: 5,
    role: 0,
    shortDescription: "Tᴇxᴛ Tᴏ Vᴏɪᴄᴇ Rᴇᴘʟʏ",
    longDescription: "Sᴇɴᴅ sᴘᴇᴄɪғɪᴄ ᴛᴇxᴛ ᴀɴᴅ ɢᴇᴛ ᴀ ᴄᴜᴛᴇ ɢɪʀʟ ᴠᴏɪᴄᴇ Rᴇᴘʟʏ",
    category: "system",
  },

  onChat: async function ({ event, message }) {
    const { body } = event;
    if (!body) return;

    const textAudioMap = {
      "i love you": "https://files.catbox.moe/npy7kl.mp3",
      "mata beta": "https://files.catbox.moe/5rdtc6.mp3",
    };

    const key = body.trim().toLowerCase();
    const audioUrl = textAudioMap[key];
    if (!audioUrl) return;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `${encodeURIComponent(key)}.mp3`);

    try {
      const response = await axios({
        method: "GET",
        url: audioUrl,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: "Vᴏɪᴄᴇ Pʟᴀʏᴇᴅ Sᴜᴄᴄᴇssғᴜʟʟʏ 💖",
          attachment: fs.createReadStream(filePath),
        });

        fs.unlink(filePath, () => {});
      });

      writer.on("error", () => {
        message.reply("Vᴏɪᴄᴇ Pʟᴀʏ Fᴀɪʟᴇᴅ 😅");
      });
    } catch (error) {
      message.reply("Vᴏɪᴄᴇ Pʟᴀɪɴɢ Eʀʀᴏʀ 😅");
    }
  },

  onStart: async function () {},
};