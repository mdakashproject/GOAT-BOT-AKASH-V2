module.exports = {
  config: {
    name: "join",
    aliases: ["addme"],
    version: "1.2",
    author: "MOHAMMAD AKASH",
    shortDescription: "Add yourself to a group by TID",
    longDescription: "Bot shows all groups and allows bot admin to join them",
    category: "owner",
    role: 2,
    guide: "{pn}join"
  },

  onStart: async function ({ message, api, event }) {
    const { threadID, messageID, senderID } = event;

    // 🔒 Extra security (double protection)
    if (!global.GoatBot.config.adminBot.includes(senderID))
      return message.reply("❌ এই কমান্ড শুধু Bot Admin ব্যবহার করতে পারবে!");

    try {
      const allThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = allThreads.filter(t => t.isGroup);

      if (!groups.length)
        return message.reply("❌ বর্তমানে কোনো গ্রুপ পাওয়া যায়নি!");

      let msg = "👑 𝗔ᴅᴍɪɴ 𝗚ʀᴏᴜᴘ 𝗟ɪsᴛ 👑\n\n";
      const groupid = [];
      const groupName = [];

      groups.forEach((g, i) => {
        msg += `${i + 1}. ${g.name}\n`;
        msg += `🔰 TID: ${g.threadID}\n`;
        msg += `💌 Message: ${g.messageCount}\n\n`;
        groupid.push(g.threadID);
        groupName.push(g.name);
      });

      msg += "✉️ Reply করুন:\nadd <number | all>";

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
      message.reply("❌ Group list আনতে সমস্যা হয়েছে!");
    }
  },

  onReply: async function ({ event, Reply, api }) {
    if (event.senderID !== Reply.author) return;

    const args = event.body.trim().toLowerCase().split(" ");
    if (args[0] !== "add")
      return api.sendMessage("❌ ভুল কমান্ড! ব্যবহার করুন: add <number | all>", event.threadID);

    const addUserToGroup = async (uid, tid, name) => {
      try {
        await api.addUserToGroup(uid, tid);
        api.sendMessage(`✅ যোগ করা হয়েছে: ${name}`, event.threadID);
      } catch {
        api.sendMessage(`❌ যোগ করা যায়নি: ${name}`, event.threadID);
      }
    };

    if (args[1] === "all") {
      for (let i = 0; i < Reply.groupid.length; i++) {
        await addUserToGroup(event.senderID, Reply.groupid[i], Reply.groupName[i]);
      }
      api.sendMessage("🎉 সব গ্রুপে যোগ করার চেষ্টা সম্পন্ন!", event.threadID);
    } else {
      const index = parseInt(args[1]) - 1;
      if (isNaN(index) || index < 0 || index >= Reply.groupid.length)
        return api.sendMessage("❌ নাম্বার ভুল!", event.threadID);

      await addUserToGroup(event.senderID, Reply.groupid[index], Reply.groupName[index]);
    }

    api.unsendMessage(event.messageID);
  }
};
