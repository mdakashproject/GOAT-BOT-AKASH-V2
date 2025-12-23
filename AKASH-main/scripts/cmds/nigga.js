const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "nigga",
    aliases: ["roast", "burn"],
    version: "1.2",
    author: "nexo_here",
    countDown: 2,
    role: 0,
    description: "Send a roast image using UID",
    category: "fun",
    guide: {
      en: "{pn} @mention\nOr use without mention to roast yourself."
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const mention = Object.keys(event.mentions || {});
      const targetUID = mention.length > 0 ? mention[0] : event.senderID;

      const url = `https://betadash-api-swordslush-production.up.railway.app/nigga?userid=${targetUID}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      const filePath = path.join(__dirname, "cache", `roast_${targetUID}.jpg`);
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      api.sendMessage({
        body: `Look I found a nigga 😂`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (e) {
      console.error("Error:", e.message);
      api.sendMessage("❌ Couldn't generate image. Try again later.", event.threadID, event.messageID);
    }
  }
};