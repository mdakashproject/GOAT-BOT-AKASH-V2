/cmd install autoreact.js module.exports = {
  config: {
    name: "autoreact",
    version: "4.1.0",
    author: "MOHAMMAD AKASH",
    role: 0,
    category: "system",
    shortDescription: "Smart auto react (emoji + text)",
    longDescription: "Auto react only when emoji or text trigger is matched"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    try {
      const { messageID, body } = event;
      if (!messageID || !body) return;

      const text = body.toLowerCase();

      // ==========================
      // Emoji Categories
      // ==========================
      const categories = [
        { emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","🥰","😍","😋","😙","😚","☺️","😗","😛","😜","🤪","😝","🤑","🤗","🤭","😹","😸"], react: "😆" },
        { emojis: ["😢","😭","🥺","😞","😔","💔","☹️","🙁","😟","😖","😣","😩","😓","😫","🥲","🥹"], react: "😢" },
        { emojis: ["❤️","💖","💘","💝","💗","💕","💞","💓","💟","❣️","😍","😘","🥰","😇","🫶","❤️‍🩹"], react: "❤️" },
        { emojis: ["😡","😠","🤬","👿","😈"], react: "😡" },
        { emojis: ["😮","😱","😲","😧","😦","😯","😳","🥵","🥶"], react: "😮" },
        { emojis: ["😎","🕶️","🔥","💯"], react: "😎" },
        { emojis: ["💀","☠️"], react: "💀" },
        { emojis: ["🎉","🥳","🎊"], react: "🎉" },
        { emojis: ["😴","💤","😪","🤤"], react: "😴" },
        { emojis: ["🤯"], react: "🤯" },
        { emojis: ["🤔"], react: "🤔" },
        { emojis: ["🤡","👹","👺"], react: "🤡" },
        { emojis: ["👍","👌","🙏","🤝","✌️","👊"], react: "👍" }
      ];

      // ==========================
      // Text Triggers
      // ==========================
      const textTriggers = [
        { keys: ["haha","lol","funny","xd","moja","dhur","abal"], react: "😆" },
        { keys: ["sad","cry","mon kharap","kharap","depressed"], react: "😢" },
        { keys: ["love","valobasi","miss you"], react: "❤️" },
        { keys: ["angry","rag","rage"], react: "😡" },
        { keys: ["wow","omg","what"], react: "😮" },
        { keys: ["cool","nice","lit"], react: "😎" },
        { keys: ["ok","yes","okay","hmm"], react: "👍" }
      ];

      let react = null;

      // ==========================
      // Emoji check first
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
      // Text check if emoji not found
      // ==========================
      if (!react) {
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

      // ==========================
      // React only if matched
      // ==========================
      if (!react) return;

      await api.setMessageReaction(react, messageID, () => {}, true);

    } catch (e) {}
  }
};
