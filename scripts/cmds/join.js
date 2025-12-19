module.exports = {
  config: {
    name: "join",
    aliases: ["addme"],
    version: "1.1",
    author: "MOHAMMAD AKASH",
    shortDescription: "Add yourself to a group by TID",
    longDescription: "Bot shows all groups and allows you to join them by replying with add <number | all>",
    category: "owner",
    guide: "{pn}join"
  },

  onStart: async function({ message, api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
      const allThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = allThreads.filter(t => t.isGroup);

      if (!groups.length) return message.reply("❌ There are currently no groups!");

      let msg = "🎭 GROUP LIST 🎭\n\n";
      const groupid = [];
      const groupName = [];

      groups.forEach((g, i) => {
        msg += `${i+1}. ${g.name}\n🔰TID: ${g.threadID}\n💌MessageCount: ${g.messageCount}\n\n`;
        groupid.push(g.threadID);
        groupName.push(g.name);
      });

      msg += "Reply to this message with: add <number | all> to join group(s)";

      api.sendMessage(msg, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          author: senderID,
          messageID: info.messageID,
          groupid,
          groupName,
          commandName: this.config.name
        });
      }, messageID);

    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to fetch group list.");
    }
  },

  onReply: async function({ event, Reply, api }) {
    const { author, groupid, groupName } = Reply;
    if (event.senderID !== author) return;

    const args = event.body.trim().toLowerCase().split(" ");
    const action = args[0];

    if (action !== "add") return api.sendMessage("❌ Invalid command. Use: add <number | all>", event.threadID);

    if (args[1] === "all") {
      for (let i = 0; i < groupid.length; i++) {
        await addUserToGroup(event.senderID, groupid[i], groupName[i], api, event.threadID);
      }
      return api.sendMessage("✅ You have been added to all groups (where bot has permission).", event.threadID);
    } else {
      const index = parseInt(args[1]) - 1;
      if (index < 0 || index >= groupid.length) return api.sendMessage("❌ Invalid number!", event.threadID);

      await addUserToGroup(event.senderID, groupid[index], groupName[index], api, event.threadID);
    }

    async function addUserToGroup(userID, tid, gName, api, threadID) {
      try {
        await api.addUserToGroup(userID, tid);
        api.sendMessage(`✅ Added you to: ${gName}`, threadID);
      } catch (err) {
        console.error(err);
        api.sendMessage(`❌ Failed to add you to: ${gName}`, threadID);
      }
    }

    api.unsendMessage(event.messageID);
  }
};
