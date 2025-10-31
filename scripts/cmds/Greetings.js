module.exports = {
  config: {
    name: "greetings",
    version: "2.0",
    author: "MOHAMMAD AKASH ONLY",
    countDown: 0,
    role: 0,
    shortDescription: "যেকোনো মেসেজে গ্রিটিং থাকলে রিপ্লাই",
    longDescription: "Hi, Hello, সালাম – যেকোনো শব্দ যেকোনো মেসেজে থাকলে পুরো নাম দিয়ে রিপ্লাই করবে।",
    category: "fun",
    guide: { en: "যেকোনো মেসেজে গ্রিটিং লিখুন" }
  },

  onStart: async function () {},

  onChat: async function ({ event, api, usersData }) {
    const msg = event.body?.trim();
    if (!msg) return;

    const lowerMsg = msg.toLowerCase();

    // ইউজারের পুরো নাম
    let userName = "বন্ধু";
    try {
      const sender = await usersData.get(event.senderID);
      userName = sender?.name || "বন্ধু";
    } catch (e) {}

    // গ্রিটিং শব্দের লিস্ট
    const hiTriggers = [
      "hi", "hello", "hellow", "helo", "hii", "hiii", "hlo", "heyy", "hey",
      "হাই", "হ্যালো", "হেলো", "হাইই", "হ্যাল্লো", "হেই"
    ];

    const salamTriggers = [
      "আসসালামু আলাইকুম", "সালাম", "আসসালামু", "আসসালাম", "আসালামু",
      "assalamu alaikum", "assalamualaikum", "salam", "w salam", "waalaikumussalam"
    ];

    // র‍্যান্ডম রিপ্লাই
    const hiReplies = [
      `🌟 হাই ${userName}! কেমন আছো? 😊`,
      `👋 হাই ${userName}! স্বাগতম! ✨`,
      `🌈 হাই ${userName}! আজকের দিনটা কেমন?`
    ];

    const helloReplies = [
      `🌼 হ্যালো ${userName}! আশা করি তুমি ভালো আছো! 💖`,
      `🎉 হ্যালো ${userName}! কী খবর? 😎`,
      `✨ হ্যালো ${userName}! তোমার হাসি দেখতে চাই! 😄`
    ];

    const salamReplies = [
      `🌙 **ওয়া আলাইকুমুস সালাম** ${userName}!\nআল্লাহ তোমাকে শান্তি দান করুন। 🤲`,
      `🕌 **ওয়া আলাইকুমুস সালাম ওয়া রহমাতুল্লাহ!**\nকেমন আছো? 😊`,
      `💚 **ওয়া আলাইকুমুস সালাম ওয়া বারাকাতুহ!**\nশুভকামনা!`
    ];

    const random = arr => arr[Math.floor(Math.random() * arr.length)];

    let replyMsg = null;

    // চেক: কোনো গ্রিটিং শব্দ আছে কি?
    if (hiTriggers.some(word => lowerMsg.includes(word))) {
      replyMsg = random([...hiReplies, ...helloReplies]);
    } 
    else if (salamTriggers.some(word => lowerMsg.includes(word))) {
      replyMsg = random(salamReplies);
    }

    // রিপ্লাই করা
    if (replyMsg) {
      api.sendMessage({
        body: replyMsg,
        mentions: [{ tag: userName, id: event.senderID }]
      }, event.threadID, null, event.messageID);
    }
  }
};
