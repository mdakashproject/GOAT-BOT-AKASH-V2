const axios = require("axios");

let baseURL = "";

(async () => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json");
    baseURL = res.data?.baby || "";
  } catch {
    console.log("⚠️ Failed to load base API URL.");
  }
})();

module.exports = {
  config: {
    name: "baby",
    version: "2.0",
    author: "Rx Abdullah_MOHAMMAD AKASH",
    countDown: 3,
    role: 0,
    category: "ai",
    shortDescription: "Chat with Baby AI 💬",
    longDescription: "Talk to Baby AI — auto teach, list & normal chat without typing system.",
    guide: {
      en: "{pn} <message> | autoteach on/off | list"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    if (!baseURL)
      return message.reply("❌ | Baby API not loaded yet, please try again in a few seconds.");

    const userName = await usersData.getName(event.senderID);
    const q = args.join(" ").toLowerCase();

    // Auto Teach ON/OFF
    if (args[0] === "autoteach") {
      const mode = args[1];
      if (!["on", "off"].includes(mode))
        return message.reply("✅ | Use: baby autoteach on/off");

      try {
        await axios.post(`${baseURL}/setting`, { autoTeach: mode === "on" });
        return message.reply(`✅ Auto teach is now ${mode === "on" ? "ON 🟢" : "OFF 🔴"}`);
      } catch (err) {
        return message.reply("❌ | Failed to update auto teach setting.");
      }
    }

    // Show List Info
    if (args[0] === "list") {
      try {
        const res = await axios.get(`${baseURL}/list`);
        return message.reply(
          `╭─╼🌟 𝐁𝐚𝐛𝐲 𝐀𝐈 𝐒𝐭𝐚𝐭𝐮𝐬\n├ 📝 𝐓𝐞𝐚𝐜𝐡𝐞𝐝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬: ${res.data.totalQuestions}\n├ 📦 𝐒𝐭𝐨𝐫𝐞𝐝 𝐑𝐞𝐩𝐥𝐢𝐞𝐬: ${res.data.totalReplies}\n╰─╼👤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: 𝐫𝐗 𝐀𝐛𝐝𝐮𝐥𝐥𝐚𝐡`
        );
      } catch {
        return message.reply("❌ | Couldn't fetch Baby AI list info.");
      }
    }

    // Normal Chat
    if (!q)
      return message.reply(["Hey baby 💖", "Yes, I'm here 😘"][Math.floor(Math.random() * 2)]);

    try {
      const res = await axios.get(`${baseURL}/simsimi?text=${encodeURIComponent(q)}&senderName=${encodeURIComponent(userName)}`);
      const reply = res.data?.response || "😅 | Baby AI didn’t understand that.";
      return message.reply(reply, (err, info) => {
        if (!err)
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            author: event.senderID
          });
      });
    } catch (e) {
      return message.reply(`❌ | Error: ${e.message}`);
    }
  },

  onReply: async function ({ message, event, usersData }) {
    if (!baseURL) return;
    const userName = await usersData.getName(event.senderID);
    const text = event.body?.toLowerCase();
    if (!text) return;

    try {
      const res = await axios.get(`${baseURL}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(userName)}`);
      const reply = res.data?.response || "🤔 | Baby AI is confused!";
      return message.reply(reply, (err, info) => {
        if (!err)
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            author: event.senderID
          });
      });
    } catch (e) {
      console.log("handleReply error:", e.message);
    }
  },

  onChat: async function ({ event, message, usersData }) {
    if (!baseURL) return;
    const text = event.body?.toLowerCase()?.trim();
    if (!text) return;

    const triggers = ["baby", "bby", "xan", "bbz", "sadiya", "mim", "akash", "বট", "আকাশ"];
    const userName = await usersData.getName(event.senderID);

    // Trigger words
    if (triggers.includes(text)) {
      const replies = [
        "𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐰𝐚𝐥𝐚𝐢𝐤𝐮𝐦 ♥",
        "ডাকো কেন 🥺 প্রেম করবা নাকি 😞",
        "বুকাচুদা আর কত বট বট করবি 🐸",
        "তুমার নুনুতে উম্মাহ 🥺🤌",
        "আকাশ কে দেখছো? তাকে কোথাও খুজে পাচ্ছি না",
        "হ্যাঁ গো জান বলো 🙂 ",
        "আলাবু বলো সোনা 🤧",
        "ওই জান কাছে আসো 🫦👅"
      ];
      return message.reply(replies[Math.floor(Math.random() * replies.length)], (err, info) => {
        if (!err)
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            author: event.senderID
          });
      });
    }

    // baby <message>
    const match = /^(baby|bby|xan|bbz|mari|মারিয়া)\s+/i;
    if (match.test(text)) {
      const q = text.replace(match, "").trim();
      if (!q) return;
      try {
        const res = await axios.get(`${baseURL}/simsimi?text=${encodeURIComponent(q)}&senderName=${encodeURIComponent(userName)}`);
        const reply = res.data?.response || "🤔 | Baby didn’t get that!";
        return message.reply(reply, (err, info) => {
          if (!err)
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              author: event.senderID
            });
        });
      } catch (e) {
        console.log("onChat error:", e.message);
      }
    }

    // Auto-teach
    if (event.type === "message_reply") {
      try {
        const set = await axios.get(`${baseURL}/setting`);
        if (!set.data.autoTeach) return;

        const ask = event.messageReply?.body?.toLowerCase()?.trim();
        const ans = event.body?.toLowerCase()?.trim();
        if (!ask || !ans || ask === ans) return;

        await axios.get(`${baseURL}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderName=${encodeURIComponent(userName)}`);
        console.log(`✅ Auto-taught: ${ask} → ${ans}`);
      } catch (e) {
        console.log("Auto-teach error:", e.message);
      }
    }
  }
};
