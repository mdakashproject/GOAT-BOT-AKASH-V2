module.exports = {
  config: {
    name: "join",
    aliases: ["boxlist"],
    version: "1.5.0",
    author: "MOHAMMAD AKASH",
    role: 2,
    shortDescription: "Paginated active group list & add yourself",
    category: "system",
    countDown: 10
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const perPage = 10;

    try {
      // সর্বোচ্চ 50 থ্রেড ফেচ করা
      const allThreads = await api.getThreadList(50, null, ["INBOX"]);

      // শুধু ACTIVE গ্রুপ
      const groups = allThreads.filter(t => t.isGroup && t.isSubscribed);
      if (!groups.length) 
        return api.sendMessage("⚠️ Bot is not currently in any group.", threadID, messageID);

      const page = 1;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const currentGroups = groups.slice(start, end);

      let msg = `📦 | BOX LIST (PAGE ${page})\n\n`;
      currentGroups.forEach((g, i) => {
        msg += `${start + i + 1}. ${g.name || "Unnamed Group"}\n`;
        msg += `🆔 ${g.threadID}\n\n`;
      });

      msg += "↩️ Reply with: add 1 | add 2 5\n➡️ Or page 2 ... to see more groups";

      api.sendMessage(msg.trim(), threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          groups,
          page,
          perPage
        });
      }, messageID);

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Failed to fetch active group list.", threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const args = event.body.trim().toLowerCase().split(/\s+/);
    const perPage = Reply.perPage || 10;

    // PAGE কমান্ড
    if (args[0] === "page") {
      const pageNum = parseInt(args[1]);
      if (isNaN(pageNum) || pageNum < 1) return api.sendMessage("❌ Invalid page number", event.threadID);

      const start = (pageNum - 1) * perPage;
      const end = start + perPage;
      const currentGroups = Reply.groups.slice(start, end);

      if (!currentGroups.length) return api.sendMessage("⚠️ No more groups", event.threadID);

      let msg = `📦 | BOX LIST (PAGE ${pageNum})\n\n`;
      currentGroups.forEach((g, i) => {
        msg += `${start + i + 1}. ${g.name || "Unnamed Group"}\n`;
        msg += `🆔 ${g.threadID}\n\n`;
      });
      msg += `↩️ Reply with: add 1 | add 2 5\n➡️ Or page ${pageNum + 1} ... to see more groups`;

      api.sendMessage(msg.trim(), event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: Reply.commandName,
          author: Reply.author,
          groups: Reply.groups,
          page: pageNum,
          perPage
        });
      });
      return;
    }

    // ADD কমান্ড
    if (args[0] === "add") {
      const addUserToGroup = async (uid, tid, name) => {
        try {
          await api.addUserToGroup(uid, tid);
          await api.sendMessage(`✅ Added you to: ${name}`, event.threadID);
        } catch {
          await api.sendMessage(`❌ Failed to add you to: ${name}`, event.threadID);
        }
      };

      for (let i = 1; i < args.length; i++) {
        const index = parseInt(args[i]) - 1;
        if (isNaN(index) || index < 0 || index >= Reply.groups.length) {
          await api.sendMessage(`❌ Invalid number: ${args[i]}`, event.threadID);
          continue;
        }
        const g = Reply.groups[index];
        await addUserToGroup(event.senderID, g.threadID, g.name || "Unnamed Group");
      }
    }
  }
};
