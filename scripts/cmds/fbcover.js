const axios = require("axios");

module.exports = {
  config: {
    name: "fbcover",
    aliases: [],
    version: "6.9",
    author: "MOHAMMAD AKASH x unknow",
    countDown: 5,
    role: 0,
    shortDescription: "Facebook cover generate",
    longDescription: "Generate Facebook cover using API",
    category: "AI",
    guide: {
      en: "{pn} v1/v2/v3 - name - title - address - email - phone - color"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const baseApiUrl = async () => {
      const base = await axios.get(
        `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
      );
      return base.data.api;
    };

    const input = args.join(" ");
    let uid;

    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else {
      uid = Object.keys(event.mentions)[0] || event.senderID;
    }

    const userName = await usersData.getName(uid);

    if (!input) {
      return api.sendMessage(
        `❌| Wrong format\nTry: fbcover v1/v2/v3 - name - title - address - email - phone - color (default = white)`,
        event.threadID,
        event.messageID
      );
    }

    const msg = input.split("-");
    const v = msg[0]?.trim() || "v1";
    const name = msg[1]?.trim() || " ";
    const subname = msg[2]?.trim() || " ";
    const address = msg[3]?.trim() || " ";
    const email = msg[4]?.trim() || " ";
    const phone = msg[5]?.trim() || " ";
    const color = msg[6]?.trim() || "white";

    api.sendMessage(
      `Processing your cover, wait koro baby 😘`,
      event.threadID,
      (err, info) => setTimeout(() => api.unsendMessage(info.messageID), 4000)
    );

    const img = `${await baseApiUrl()}/cover/${v}?name=${encodeURIComponent(
      name
    )}&subname=${encodeURIComponent(subname)}&number=${encodeURIComponent(
      phone
    )}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(
      email
    )}&colour=${encodeURIComponent(color)}&uid=${uid}`;

    try {
      const response = await axios.get(img, { responseType: "stream" });

      api.sendMessage(
        {
          body:
            `✿━━━━━━━━━━━━━━━━━━━━━━━━━━━✿\n` +
            `🔵 FIRST NAME: ${name}\n` +
            `⚫ SECOND NAME: ${subname}\n` +
            `⚪ ADDRESS: ${address}\n` +
            `📫 MAIL: ${email}\n` +
            `☎️ PHONE NO.: ${phone}\n` +
            `☢️ COLOR: ${color}\n` +
            `💁 USER NAME: ${userName}\n` +
            `✅ Version: ${v}\n` +
            `✿━━━━━━━━━━━━━━━━━━━━━━━━━━━✿`,
          attachment: response.data
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "❌ Error occurred while generating FB cover.",
        event.threadID
      );
    }
  }
};
