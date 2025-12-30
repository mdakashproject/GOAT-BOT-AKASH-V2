module.exports = {
  config: {
    name: "join",
    aliases: ["boxlist"],
    version: "1.2.1",
    author: "MOHAMMAD AKASH Optimize & Fixd",
    role: 2,
    shortDescription: "Show all active groups & add yourself",
    category: "system",
    countDown: 10
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
      const allThreads = await api.getThreadList(200, null, ["INBOX"]);

      // ✅ FIX: only ACTIVE groups where bot is still present
      const groups = allThreads.filter(
        t => t.isGroup === true && t.isSubscribed === true
      );

      if (!groups.length)
        return api.sendMessage(
          "⚠️ Bot is not currently in any group.",
          threadID,
          messageID
        );

      let msg = "📦 | BOX LIST (ACTIVE GROUPS ONLY)\n\n";
      const groupid = [];
      const groupName = [];

      groups.forEach((g, i) => {
        msg += `${i + 1}. ${g.name || "Unnamed Group"}\n`;
        msg += `🆔 ${g.threadID}\n\n`;
        groupid.push(g.threadID);
        groupName.push(g.name || "Unnamed Group");
      });

      msg += "↩️ Reply with: add 1 | add 2 5";

      api.sendMessage(msg.trim(), threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          groupid,
          groupName
        });
      }, messageID);

    } catch (e) {
      console.error(e);
      api.sendMessage(
        "❌ Failed to fetch active group list.",
        threadID,
        messageID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const args = event.body.trim().toLowerCase().split(/\s+/);
    if (args[0] !== "add")
      return api.sendMessage(
        "❌ Use: add <number>",
        event.threadID
      );

    // 🔁 SAME working add logic (from join.js)
    const addUserToGroup = async (uid, tid, name) => {
      try {
        await api.addUserToGroup(uid, tid);
        await api.sendMessage(
          `✅ Added you to: ${name}`,
          event.threadID
        );
      } catch {
        await api.sendMessage(
          `❌ Failed to add you to: ${name}`,
          event.threadID
        );
      }
    };

    for (let i = 1; i < args.length; i++) {
      const index = parseInt(args[i]) - 1;
      if (isNaN(index) || index < 0 || index >= Reply.groupid.length) {
        await api.sendMessage(
          `❌ Invalid number: ${args[i]}`,
          event.threadID
        );
        continue;
      }

      await addUserToGroup(
        event.senderID,
        Reply.groupid[index],
        Reply.groupName[index]
      );
    }
  }
};
