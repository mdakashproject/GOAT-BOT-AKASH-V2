const { getTime, drive } = global.utils;
const { nickNameBot } = global.GoatBot.config; // ⬅️ এটুকু যুক্ত করো উপরে

module.exports = {
  config: {
    name: "welcome",
    version: "2.3",
    author: "Mohammad AkasH",
    category: "events"
  },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      defaultWelcomeMessage:
        "__Assalamu Alaikum__\n═══════════════\n__𝑾𝑬𝑳𝑪𝑶𝑴𝑬 ➤ {userName}__\n\n_ᴏɴ ᴏᴜʀ {threadName}_\n_ᴡᴇ ᴀʀᴇ ᴘʟᴇᴀsᴇᴅ ᴛᴏ ᴡᴇʟᴄᴏᴍᴇ ʏᴏᴜ_\n       __!! ᴡᴇʟᴄᴏᴍᴇ !!__\n__'ʏᴏᴜ ᴀʀᴇ ᴛʜᴇ__\n        __{memberCount}ᴛʜ ᴍᴇᴍʙᴇʀ ᴏꜰ ᴛʜɪs ɢʀᴏᴜᴘ___!!\n\n___𝙰ᴅᴅᴇᴅ ʙʏ : {inviterName}___\n\n𝙱ᴏᴛ ᴏᴡɴᴇʀ : 𝙼ᴏʜᴀᴍᴍᴀᴅ 𝘼ᴋᴀꜱʜ",
      botAddedMessage:
        "━━━━━━━━━━━━━━━━━━━\n🤖 ᴛʜᴀɴᴋ ʏᴏᴜ ғᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ! 💖\n\n⚙️ ʙᴏᴛ ᴘʀᴇꜰɪx : /\n📜 ᴛʏᴘᴇ /help ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs\n\n✨ ʟᴇᴛ's ᴍᴀᴋᴇ ᴛʜɪs ɢʀᴏᴜᴘ ᴇᴠᴇɴ ᴍᴏʀᴇ ꜰᴜɴ ᴛᴏɢᴇᴛʜᴇʀ! 😄\n━━━━━━━━━━━━━━━━━━━"
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData.settings.sendWelcomeMessage) return;

    const addedMembers = event.logMessageData.addedParticipants;
    const hours = getTime("HH");
    const threadName = threadData.threadName;
    const prefix = global.utils.getPrefix(threadID);

    for (const user of addedMembers) {
      const userID = user.userFbId;
      const botID = api.getCurrentUserID();

      // ✅ যদি বটকে অ্যাড করা হয়
      if (userID == botID) {
        if (nickNameBot)
          await api.changeNickname(nickNameBot, threadID, botID);
        return message.send(getLang("botAddedMessage", prefix));
      }

      // ✅ যদি নতুন ইউজার হয়
      const userName = user.fullName;
      const inviterName = await usersData.getName(event.author);
      const memberCount = event.participantIDs.length;

      let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

      const session =
        hours <= 10
          ? getLang("session1")
          : hours <= 12
          ? getLang("session2")
          : hours <= 18
          ? getLang("session3")
          : getLang("session4");

      welcomeMessage = welcomeMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{threadName\}/g, threadName)
        .replace(/\{memberCount\}/g, memberCount)
        .replace(/\{inviterName\}/g, inviterName)
        .replace(/\{session\}/g, session)
        .replace(/\{time\}/g, hours);

      const form = {
        body: welcomeMessage,
        mentions: [{ tag: userName, id: userID }]
      };

      // ✅ অ্যাটাচমেন্ট থাকলে
      if (threadData.data.welcomeAttachment) {
        const files = threadData.data.welcomeAttachment;
        const attachments = files.reduce((acc, file) => {
          acc.push(drive.getFile(file, "stream"));
          return acc;
        }, []);
        form.attachment = (await Promise.allSettled(attachments))
          .filter(({ status }) => status == "fulfilled")
          .map(({ value }) => value);
      }

      message.send(form);
    }
  }
};
