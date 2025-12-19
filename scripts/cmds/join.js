/cmd install join.js const sanitizeName = name => name.replace(/[\u{10000}-\u{10FFFF}]/gu, "").trim(); // Remove emojis/fancy chars

module.exports = {
  config: {
    name: "join",
    aliases: ["addme"],
    version: "1.3",
    author: "MOHAMMAD AKASH",
    countDown: 60,
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

      let msg = "🎭 Gʀᴏᴜᴘ Lɪsᴛ 🎭\n\n";
      const groupid = [];
      const groupName = [];

      groups.forEach((g, i) => {
        const safeName = sanitizeName(g.name);
        msg += `• ${i+1}. ${safeName}\n🔰TID: ${g.threadID}\n💌MessageCount: ${g.messageCount}\n\n`;
        groupid.push(g.threadID);
        groupName.push(safeName);
      });

      msg += "Reply with: aᴅᴅ <number | all> to join group(s)";

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

    if (action !== "add") return api.sendMessage("❌ Invalid command. Use: aᴅᴅ <number | all>", event.threadID);

    const addGroup = async (userID, tid, gName) => {
      // Send loading message first
      const loadingMsg = await api.sendMessage(`⏳ Jᴏɪɴɪɴɢ... Jᴜsᴛ A Mᴏᴍᴇɴᴛ ⏳`, event.threadID);

      try {
        await api.addUserToGroup(userID, tid);
        await api.unsendMessage(loadingMsg.messageID); // Remove loading
        api.sendMessage(`✅ Sᴜᴄᴄᴇss: You have joined ${gName}`, event.threadID);
      } catch (err) {
        await api.unsendMessage(loadingMsg.messageID); // Remove loading
        console.error(err);
        api.sendMessage(`❌ Failed to add you to: ${gName}`, event.threadID);
      }
    };

    if (args[1] === "all") {
      for (let i = 0; i < groupid.length; i++) {
        await addGroup(event.senderID, groupid[i], groupName[i]);
      }
      return api.sendMessage("✅ You have been added to all groups (where bot has permission).", event.threadID);
    } else {
      const index = parseInt(args[1]) - 1;
      if (index < 0 || index >= groupid.length) return api.sendMessage("❌ Invalid number!", event.threadID);
      await addGroup(event.senderID, groupid[index], groupName[index]);
    }

    api.unsendMessage(event.messageID);
  }
};
