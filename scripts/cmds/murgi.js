const delay = (ms) => new Promise(res => setTimeout(res, ms));

module.exports = {
  config: {
    name: "murgi",
    version: "1.0.2",
    role: 2,
    author: "Akash Edit",
    description: "murgi cu*dar File 🙂",
    category: "fun",
    usages: "@mention",
    cooldowns: 5,
  },

  onStart: async function({ message, event }) {
    try {
      const mention = Object.keys(event.mentions)[0];
      if (!mention) {
        return message.reply("Please @mention a target first!");
      }

      const name = event.mentions[mention];
      const arraytag = [{ id: mention, tag: name }];

      const messages = [
        "${name} খানকির ছেলে/মেয়ে তোর আব্বুর চুদন খাওয়ার জন্য রেডি তো?",
        "${name} তোরে জন্ম দিয়া ভুল করছি রে 😔",
        "${name} ওইদিন ফার্মেসি বন্ধ থাকলে আজ তোকে দেখতে হতো না 😡"
      ];

      for (const msg of messages) {
        await delay(2500);
        message.reply({ body: msg, mentions: arraytag });
      }

    } catch (err) {
      console.error(err);
      message.reply("❌ Something went wrong!");
    }
  }
};
