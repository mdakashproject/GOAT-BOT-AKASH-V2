const axios = require("axios");
const fs = require("fs-extra");
const path = __dirname + "/coinxbalance.json";

// ✅ Create file if not exists
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// 🔹 Get balance
function getBalance(userID) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    if (data[userID]?.balance !== undefined) return data[userID].balance;
    return userID === "100078049308655" ? 10000 : 100;
  } catch {
    return 100;
  }
}

// 🔹 Set balance
function setBalance(userID, balance) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    data[userID] = { balance: Math.max(0, balance) };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch {}
}

// 🔹 Format balance
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, "") + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, "") + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, "") + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, "") + "k$";
  return num + "$";
}

module.exports = {
  config: {
    name: "quiz",
    version: "6.2",
    author: "Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
    countDown: 5,
    role: 0,
    shortDescription: "✦ Bᴀɴɢʟᴀ Qᴜɪᴢ ✦ Cᴏɪɴ Gᴀᴍᴇ 🎯",
    category: "game",
    guide: { en: "{p}quiz | {p}quiz h" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const balance = getBalance(senderID);

    // 🧠 Help
    if (args[0]?.toLowerCase() === "h" || args[0] === "help") {
      return api.sendMessage(
`🧠 Qᴜɪᴢ Gᴜɪᴅᴇ 🎯
━━━━━━━━━━━━━━━
✅ Cᴏʀʀᴇᴄᴛ: +1,000 Cᴏɪɴs
❌ Wʀᴏɴɢ: −50 Cᴏɪɴs
💰 Mɪɴɪᴍᴜᴍ Bᴀʟᴀɴᴄᴇ: 30
━━━━━━━━━━━━━━━
🎮 Exᴀᴍᴘʟᴇ: !quiz`,
        threadID,
        messageID
      );
    }

    // 💰 Low balance
    if (balance < 30) {
      return api.sendMessage(
`⚠️ Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ!
💎 Yᴏᴜʀ Bᴀʟᴀɴᴄᴇ: ${formatBalance(balance)}
🎮 Mɪɴɪᴍᴜᴍ Rᴇǫᴜɪʀᴇᴅ: 30$`,
        threadID,
        messageID
      );
    }

    try {
      const { data } = await axios.get(
        "https://rubish-apihub.onrender.com/rubish/quiz-api?category=Bangla&apikey=rubish69"
      );

      if (!data?.question || !data?.answer) throw new Error("Invalid API");

      const quizMsg =
`✦ Bᴀɴɢʟᴀ Qᴜɪᴢ ✦
${data.question}

🇦 ${data.A} • 🇧 ${data.B}
🇨 ${data.C} • 🇩 ${data.D}

✍️ Rᴇᴘʟʏ: A / B / C / D`;

      api.sendMessage(quizMsg, threadID, (err, info) => {
        if (err || !info) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "quiz",
          author: senderID,
          answer: data.answer,
          messageID: info.messageID
        });
      });

    } catch {
      api.sendMessage(
`❌ Sᴏᴍᴇᴛʜɪɴɢ Wᴇɴᴛ Wʀᴏɴɢ!
😵 Fᴀɪʟᴇᴅ ᴛᴏ Lᴏᴀᴅ Qᴜɪᴢ.
Pʟᴇᴀsᴇ Tʀʏ Aɢᴀɪɴ Lᴀᴛᴇʀ.`,
        threadID,
        messageID
      );
    }
  },

  // 🔁 Reply handler
  onReply: async function ({ api, event, Reply }) {
    const { senderID, body, threadID } = event;
    if (senderID !== Reply.author) return;

    const userAns = body.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(userAns)) {
      return api.sendMessage(
`⚠️ Iɴᴠᴀʟɪᴅ Rᴇᴘʟʏ!
✍️ Tʏᴘᴇ Oɴʟʏ: A / B / C / D
Exᴀᴍᴘʟᴇ: A`,
        threadID
      );
    }

    let balance = getBalance(senderID);

    if (userAns === Reply.answer) {
      balance += 1000;
      setBalance(senderID, balance);
      await api.unsendMessage(Reply.messageID);
      global.GoatBot.onReply.delete(Reply.messageID);

      api.sendMessage(
`✅ Cᴏʀʀᴇᴄᴛ Aɴsᴡᴇʀ!
🎉 Yᴏᴜ Eᴀʀɴᴇᴅ +1,000 Cᴏɪɴs
💎 Nᴇᴡ Bᴀʟᴀɴᴄᴇ: ${formatBalance(balance)}`,
        threadID
      );
    } else {
      balance = Math.max(0, balance - 50);
      setBalance(senderID, balance);

      api.sendMessage(
`❌ Wʀᴏɴɢ Aɴsᴡᴇʀ!
😔 −50 Cᴏɪɴs Dᴇᴅᴜᴄᴛᴇᴅ
💎 Cᴜʀʀᴇɴᴛ Bᴀʟᴀɴᴄᴇ: ${formatBalance(balance)}
🔄 Tʀʏ Aɢᴀɪɴ!`,
        threadID
      );
    }
  }
};
