module.exports = {
  config: {
    name: "join",
    aliases: ["addme"],
    version: "1.3",
    author: "MOHAMMAD AKASH",
    shortDescription: "Add yourself to a group by TID",
    longDescription: "Bot shows all groups and allows bot admin to join them",
    category: "owner",
    role: 2,
    guide: "{pn}join"
  },

  onStart: async function ({ message, api, event }) {
    const { threadID, messageID, senderID } = event;

    if (!global.GoatBot.config.adminBot.includes(senderID))
      return message.reply("❌ Tʜɪs Cᴏᴍᴍᴀɴᴅ Iꜱ Fᴏʀ Bᴏᴛ Aᴅᴍɪɴ Oɴʟʏ!");

    try {
      const allThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = allThreads.filter(t => t.isGroup);

      if (!groups.length)
        return message.reply("❌ Tʜᴇʀᴇ Aʀᴇ Cᴜʀʀᴇɴᴛʟʏ Nᴏ Gʀᴏᴜᴘs!");

      let msg = "🎭 Gʀᴏᴜᴘ Lɪsᴛ 🎭\n\n";
      const groupid = [];
      const groupName = [];

      groups.forEach((g, i) => {
        msg += `${i + 1}. ${g.name}\n`;
        msg += `🔰 Tɪᴅ: ${g.threadID}\n`;
        msg += `💌 MᴇssᴀɢᴇCᴏᴜɴᴛ: ${g.messageCount}\n\n`;
        groupid.push(g.threadID);
        groupName.push(g.name);
      });

      msg += "Rᴇᴘʟʏ Tᴏ Tʜɪs Mᴇssᴀɢᴇ Wɪᴛʜ:\nAᴅᴅ <ɴᴜᴍʙᴇʀ | ᴀʟʟ>";

      api.sendMessage(msg, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          author: senderID,
          messageID: info.messageID,
          groupid,
          groupName,
          commandName: this.config.name
        });
      }, messageID);

    } catch (e) {
      console.error(e);
      message.reply("❌ Fᴀɪʟᴇᴅ Tᴏ Fᴇᴛᴄʜ Gʀᴏᴜᴘ Lɪsᴛ.");
    }
  },

  onReply: async function ({ event, Reply, api }) {
    if (event.senderID !== Reply.author) return;

    const args = event.body.trim().toLowerCase().split(" ");
    if (args[0] !== "add")
      return api.sendMessage("❌ Iɴᴠᴀʟɪᴅ Cᴏᴍᴍᴀɴᴅ. Uꜱᴇ: Aᴅᴅ <ɴᴜᴍʙᴇʀ | ᴀʟʟ>", event.threadID);

    const addUserToGroup = async (uid, tid, name) => {
      try {
        await api.addUserToGroup(uid, tid);
        api.sendMessage(`✅ Aᴅᴅᴇᴅ Yᴏᴜ Tᴏ: ${name}`, event.threadID);
      } catch {
        api.sendMessage(`❌ Fᴀɪʟᴇᴅ Tᴏ Aᴅᴅ Yᴏᴜ Tᴏ: ${name}`, event.threadID);
      }
    };

    if (args[1] === "all") {
      for (let i = 0; i < Reply.groupid.length; i++) {
        await addUserToGroup(event.senderID, Reply.groupid[i], Reply.groupName[i]);
      }
      api.sendMessage("🎉 Aᴛᴛᴇᴍᴘᴛᴇᴅ Tᴏ Aᴅᴅ Yᴏᴜ Tᴏ Aʟʟ Gʀᴏᴜᴘs.", event.threadID);
    } else {
      const index = parseInt(args[1]) - 1;
      if (isNaN(index) || index < 0 || index >= Reply.groupid.length)
        return api.sendMessage("❌ Iɴᴠᴀʟɪᴅ Nᴜᴍʙᴇʀ!", event.threadID);

      await addUserToGroup(event.senderID, Reply.groupid[index], Reply.groupName[index]);
    }

    api.unsendMessage(event.messageID);
  }
};
