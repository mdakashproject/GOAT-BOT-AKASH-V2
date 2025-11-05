const { getTime, drive } = global.utils;
const { nickNameBot } = global.GoatBot.config; // ⬅️ এটুকু যুক্ত করো উপরে

module.exports = {
  config: {
    name: "welcome",
    version: "2.3",
    author: "Mohammad Akash (Fix by GPT-5)",
    category: "events"
  },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      defaultWelcomeMessage:
        "__আসসালামু আলাইকুম__\n═══════════════\n__𝑾𝑬𝑳𝑪𝑶𝑴𝑬 ➤ {userName}__\n\n_আমাদের {threadName}_\n_এর পক্ষ থেকে আপনাকে_\n       __!! স্বাগতম !!__\n__'আপনি এই__\n        __গ্রুপের {memberCount} নাম্বার মেমবার___!!\n\n___𝙰𝚍𝚍𝚎𝚍 𝙱𝚢 : {inviterName}___\n\n𝙱𝚘𝚝 𝙾𝚠𝚗𝚎𝚛 : 𝙼𝚘𝚑𝚊𝚖𝚖𝚊𝚍 𝙰𝚔𝚊𝚜𝚑",
      botAddedMessage:
        "━━━━━━━━━━━━━━━━━━━━━\n🤖 ধন্যবাদ আমাকে গ্রুপে অ্যাড করার জন্য 💖\n\n⚙️ Bot Prefix :  /\n📜 সব কমান্ড দেখতে লিখুন :  /help\n\nচলুন একসাথে এই গ্রুপটা আরও মজার করে তুলি! 😄\n━━━━━━━━━━━━━━━━━━━━━"
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

      // ✅ নিকনেম সেট করা
      try {
        const nickname = `★ ${userName} | ${threadName} ★`;
        await api.changeNickname(nickname, threadID, userID);
      } catch (err) {
        console.error("❌ Nickname set error:", err.message);
      }

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
