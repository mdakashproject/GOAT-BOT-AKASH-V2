const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_ENDPOINT = "https://tawsif.is-a.dev/gemini/nano-banana";

module.exports = {
  config: {
    name: "editpro",
    aliases: ["edit2", "nanopro"],
    version: "1.0",
    author: "MOHAMMAD AKASH x rX",
    role: 0,
    cooldown: 5,
    description: "AI image editing with prompt + image",
    guide: {
      en: "{pn} <prompt> <image_url>\nReply to an image: {pn} <prompt>"
    }
  },

  onStart: async function ({ message, event, args }) {

    let prompt = args.join(" ").trim();
    let imageUrl;

    // Reply image handler
    if (event.messageReply && event.messageReply.attachments?.length > 0) {
      const att = event.messageReply.attachments[0];
      if (att.type === "photo") imageUrl = att.url;
    }

    // URL support inside message
    if (!imageUrl) {
      const findUrl = args.find(x => x.startsWith("http"));
      if (findUrl) {
        imageUrl = findUrl;
        prompt = prompt.replace(findUrl, "").trim();
      }
    }

    if (!imageUrl)
      return message.reply("❌ Please reply to an image or provide an image URL.");

    if (!prompt)
      return message.reply("❌ Please write a prompt.\nExample: !edit cartoon");

    // Notify user
    await message.reply("⏳ Editing your image...");

    let filePath;

    try {
      const apiUrl = `${API_ENDPOINT}?prompt=${encodeURIComponent(
        prompt
      )}&url=${encodeURIComponent(imageUrl)}`;

      const res = await axios.get(apiUrl);

      if (!res.data.success || !res.data.imageUrl)
        throw new Error(res.data.error || "API returned invalid result");

      const editedURL = res.data.imageUrl;

      // Download edited image
      const imgStream = await axios.get(editedURL, { responseType: "stream" });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

      filePath = path.join(cacheDir, `edit_${Date.now()}.png`);

      const writer = fs.createWriteStream(filePath);
      imgStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return message.reply(
        {
          body: `✨ Edited image generated!\nPrompt: ${prompt}`,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      return message.reply("❌ Failed to edit the image.\nError: " + err.message);
    }
  }
};
