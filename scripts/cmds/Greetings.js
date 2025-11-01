module.exports = {  
  config: {  
    name: "greetings",  
    version: "3.0",  
    author: "MOHAMMAD AKASH ❤️‍🩹",  
    countDown: 0,  
    role: 0,  
    shortDescription: "সব ধরনের গ্রিটিং, সকাল, রাত, ধন্যবাদ, ভালোবাসা এর রিপ্লাই",  
    longDescription: "যেকোনো মেসেজে গ্রিটিং, সকাল, রাত, ধন্যবাদ, ভালোবাসা থাকলে রিপ্লাই করবে।",  
    category: "fun",  
    guide: { en: "যেকোনো মেসেজে গ্রিটিং লিখুন" }  
  },  

  onStart: async function () {}, // ← এটা রাখতে হবে!  

  onChat: async function ({ event, api, usersData }) {  
    const msg = event.body?.trim();  
    if (!msg) return;  

    const lowerMsg = msg.toLowerCase();  
    let userName = "বন্ধু";  

    try {  
      const sender = await usersData.get(event.senderID);  
      userName = sender?.name || "বন্ধু";  
    } catch (e) {}  

    const triggers = {  
      hi: ["hi", "hello", "hellow", "helo", "hii", "hiii", "hlo", "heyy", "hey", "হাই", "হ্যালো", "হেলো", "হাইই"],  
      salam: ["আসসালামু আলাইকুম", "সালাম", "আসসালামু", "assalamu alaikum", "assalamualaikum", "salam", "w salam"],  
      gm: ["gm", "good morning", "সুপ্রভাত", "শুভ সকাল", "morning"],  
      gn: ["gn", "good night", "শুভ রাত্রি", "গুড নাইট", "night"],  
      thanks: ["thanks", "thank you", "ধন্যবাদ", "শুকরিয়া", "thx", "tq"],  
      love: ["love you", "i love you", "ভালোবাসি", "লাভ ইউ", "luv u"],  
      bye: ["bye", "tata", "see you", "খোদা হাফেজ", "আল্লাহ হাফেজ", "bye bye"],  
      fork: ["fork", "github", "repo", "repository"]  
    };  

    const replies = {  
      hi: [  
        `🌟 হাই ${userName}! কেমন আছো? 😊`,  
        `👋 হাই ${userName}! স্বাগতম! ✨`,  
        `🌈 হাই ${userName}! আজকের দিনটা কেমন?`  
      ],  
      salam: [  
        `🌙 **ওয়া আলাইকুমুস সালাম** ${userName}!\nআল্লাহ তোমাকে শান্তি দান করুন। 🤲`,  
        `🕌 **ওয়া আলাইকুমুস সালাম ওয়া রহমাতুল্লাহ!**\nকেমন আছো? 😊`  
      ],  
      gm: [  
        `☀️ শুভ সকাল ${userName}! আজকের দিনটা সুন্দর হোক! 🌸`,  
        `🌞 গুড মর্নিং ${userName}! নতুন দিনের শুভকামনা!`  
      ],  
      gn: [  
        `🌙 শুভ রাত্রি ${userName}! মিষ্টি স্বপ্ন দেখো! 😴`,  
        `⭐ গুড নাইট ${userName}! আল্লাহ হাফেজ!`  
      ],  
      thanks: [  
        `💖 স্বাগতম ${userName}! তোমার ধন্যবাদের জন্য! 😊`,  
        `🙏 ধন্যবাদ ${userName}! তুমি সেরা!`  
      ],  
      love: [  
        `❤️ আমিও তোমাকে ভালোবাসি ${userName}! 💕`,  
        `💞 লাভ ইউ টু ${userName}! তুমি আমার ফেভারিট! 😘`  
      ],  
      bye: [  
        `👋 বাই ${userName}! আবার দেখা হবে! 😊`,  
        `🌟 খোদা হাফেজ ${userName}! ভালো থেকো!`  
      ],  
      fork: [  
        `🔗 আমার GitHub Repo:\nhttps://github.com/mdakashproject/GOAT-BOT-AKASH-V2.git`  
      ]  
    };  

    const random = arr => arr[Math.floor(Math.random() * arr.length)];  

    for (const [key, words] of Object.entries(triggers)) {  
      if (words.some(word => lowerMsg.includes(word))) {  
        const replyMsg = random(replies[key]);  
        api.sendMessage({  
          body: replyMsg,  
          mentions: [{ tag: userName, id: event.senderID }]  
        }, event.threadID, null, event.messageID);  
        break;  
      }  
    }  
  }  
};
