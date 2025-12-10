module.exports = {
  config: {
    name: "autoreact",
    version: "4.0.0",
    author: "MOHAMMAD AKASH",
    role: 0,
    category: "system",
    shortDescription: "Full mega auto react with all emoji + text",
    longDescription: "Bot reacts automatically based on emojis & common words"
  },

  onStart: async function () { },

  onChat: async function ({ api, event }) {
    try {
      const { messageID, body } = event;
      if (!messageID || !body) return;

      const text = body.toLowerCase();

      // ==========================
      // Category-based emoji reaction
      // ==========================
      const categories = [
        { emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","🥰","😍","😋","😙","😚","☺️","😗","😛","😜","🤪","😝","🤑","🤗","🤭","😹","😸"], react: "😆" }, // happy/funny
        { emojis: ["😢","😭","🥺","😞","😔","💔","☹️","🙁","😟","😖","😣","😩","😓","😫","🥲","🥹","😩"], react: "😢" }, // sad
        { emojis: ["❤️","💖","💘","💝","💗","💕","💞","💓","💟","❣️","😍","😘","🥰","😇","😛","🫶","❤️‍🩹"], react: "❤️" }, // love
        { emojis: ["😡","😠","🤬","👿","😈"], react: "😡" }, // angry
        { emojis: ["😮","😱","😲","😧","😦","😯","😳","🥵","🥶"], react: "😮" }, // shocked
        { emojis: ["😎","🕶️","🔥","💯","🥵"], react: "😎" }, // cool/fire
        { emojis: ["💀","☠️"], react: "💀" }, // dark
        { emojis: ["🎉","🥳","🎊"], react: "🎉" }, // party
        { emojis: ["😴","💤","😪","🤤"], react: "😴" }, // sleep
        { emojis: ["🤯"], react: "🤯" }, // mind blown
        { emojis: ["🤔"], react: "🤔" }, // thinking
        { emojis: ["🤡","👹","👺"], react: "🤡" }, // funny/troll
        { emojis: ["👍","👌","🙏","🤝","✌️","👊"], react: "👍" } // like
      ];

      // ==========================
      // Common text-based reaction
      // ==========================
      const textTriggers = [
        { keys: ["haha","lol","funny","xd","moja","bal","bukacuda","dhur","abal","magi","hmm"], react: "😆" },
        { keys: ["sad","cry","mon kharap","kharap","depressed"], react: "😢" },
        { keys: ["love","valobasi","miss you","❤️"], react: "❤️" },
        { keys: ["angry","rag","rage"], react: "😡" },
        { keys: ["wow","omg","what"], react: "😮" },
        { keys: ["cool","nice","lit"], react: "😎" },
        { keys: ["ok","yes","hmm","okay"], react: "👍" }
      ];

      let react = "😘"; // default

      // ==========================
      // check emoji first
      // ==========================
      outer:
      for (const cat of categories) {
        for (const e of cat.emojis) {
          if (text.includes(e)) {
            react = cat.react;
            break outer;
          }
        }
      }

      // ==========================
      // check text triggers if no emoji matched
      // ==========================
      if (react === "😘") {
        outer2:
        for (const t of textTriggers) {
          for (const k of t.keys) {
            if (text.includes(k)) {
              react = t.react;
              break outer2;
            }
          }
        }
      }

      await api.setMessageReaction(react, messageID, () => {}, true);

    } catch {}
  }
};
