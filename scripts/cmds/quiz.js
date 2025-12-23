const axios = require("axios");
const fs = require("fs-extra");
const path = __dirname + "/coinxbalance.json";

// ✅ ফাইল না থাকলে তৈরি করো
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// 🔹 ব্যালেন্স পড়া
function getBalance(userID) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    if (data[userID]?.balance !== undefined) return data[userID].balance;
    return userID === "100078049308655" ? 10000 : 100;
  } catch {
    return 100;
  }
}

// 🔹 ব্যালেন্স সেট করা
function setBalance(userID, balance) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    data[userID] = { balance: Math.max(0, balance) };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch {}
}

// 🔹 সংখ্যা ফরম্যাট
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
    version: "6.0",
    author: "MOHAMMAD AKASH",
    countDown: 5,
    role: 0,
    shortDescription: "✦ বাংলা কুইজ ✦ কয়েন সহ 🎯",
    category: "game",
    guide: { en: "{p}quiz | {p}quiz h" },
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const balance = getBalance(senderID);
    const TIMEOUT = 20000;

    // 🧠 সাহায্য মেনু
    if (args[0]?.toLowerCase() === "h" || args[0] === "help") {
      const helpMsg = `🧠 কুইজ গাইড 🎯
━━━━━━━━━━━━━━━
✅ সঠিক উত্তর: +১,০০০ কয়েন
❌ ভুল উত্তর: -৫০ কয়েন
⏳ সময়: ২০ সেকেন্ড
💰 ন্যূনতম ব্যালেন্স: ৩০ কয়েন
━━━━━━━━━━━━━━━
🎮 উদাহরণ: !quiz`;
      return api.sendMessage(helpMsg, threadID, messageID);
    }

    // 💰 কয়েন চেক
    if (balance < 30) {
      const low = `⚠️ কয়েন কম!
💎 বর্তমান: ${formatBalance(balance)}
🎮 খেলতে ন্যূনতম দরকার: 30$`;
      return api.sendMessage(low, threadID, messageID);
    }

    try {
      // 📡 কুইজ API
      const { data } = await axios.get(
        "https://rubish-apihub.onrender.com/rubish/quiz-api?category=Bangla&apikey=rubish69"
      );

      if (!data?.question || !data?.answer) throw new Error("Invalid API");

      const question = `✦ বাংলা কুইজ ✦
${data.question}

🇦 ${data.A} • 🇧 ${data.B}
🇨 ${data.C} • 🇩 ${data.D}

⏰ ২০ সেকেন্ড | উত্তর: A/B/C/D`;

      api.sendMessage(question, threadID, (err, info) => {
        if (err || !info) return;

        const timeout = setTimeout(async () => {
          try {
            await api.unsendMessage(info.messageID);
            api.sendMessage(
              `⏰ সময় শেষ!
✅ সঠিক উত্তর ছিল: ${data.answer}`,
              threadID
            );
          } catch {}
          global.GoatBot.onReply.delete(info.messageID);
        }, TIMEOUT);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          author: senderID,
          answer: data.answer,
          messageID: info.messageID,
          timeout,
        });
      });
    } catch (err) {
      return api.sendMessage(
        `❌ সমস্যা হয়েছে!
😵 কুইজ লোড করা যায়নি, পরে আবার চেষ্টা করো।`,
        threadID,
        messageID
      );
    }
  },

  // 🔁 উত্তর হ্যান্ডলিং
  onReply: async function ({ api, event, Reply }) {
    const { senderID, body, threadID } = event;
    if (senderID !== Reply.author) return;

    const answer = body.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(answer)) {
      return api.sendMessage(
        `⚠️ শুধু লিখো A / B / C / D\nউদাহরণ: A`,
        threadID
      );
    }

    clearTimeout(Reply.timeout);
    const correct = answer === Reply.answer;
    let balance = getBalance(senderID);

    if (correct) {
      balance += 1000;
      setBalance(senderID, balance);
      await api.unsendMessage(Reply.messageID);
      global.GoatBot.onReply.delete(Reply.messageID);

      api.sendMessage(
        `✅ সঠিক উত্তর!
🎉 তুমি জিতেছ +১,০০০ কয়েন!
💎 নতুন ব্যালেন্স: ${formatBalance(balance)}`,
        threadID
      );
    } else {
      balance = Math.max(0, balance - 50);
      setBalance(senderID, balance);

      api.sendMessage(
        `❌ ভুল উত্তর!
😔 -৫০ কয়েন কেটে নেওয়া হয়েছে
💎 বর্তমান ব্যালেন্স: ${formatBalance(balance)}
🔄 আবার চেষ্টা করো!`,
        threadID
      );
    }
  },
};
