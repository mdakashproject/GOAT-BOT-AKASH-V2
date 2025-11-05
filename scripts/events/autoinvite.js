const { getTime } = global.utils;

module.exports = {
  config: {
    name: "autoinvite",
    version: "2.0",
    author: "Mohammad Akash",
    category: "events"
  },

  onStart: async ({ api, event, usersData, message }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;

    // যদি কেউ নিজের ইচ্ছায় লিভ নেয় (kick না)
    if (leftID === author) {
      const userName = await usersData.getName(leftID);

      // ইউজার নামকে বোল্ড করতে Unicode ব্যবহার
      const boldName = userName.split("").map(c => {
        const code = c.charCodeAt(0);
        // অক্ষরকে Mathematical Bold Unicode এ রূপান্তর
        if (code >= 65 && code <= 90) return String.fromCharCode(code + 0x1D400 - 65); // A-Z
        if (code >= 97 && code <= 122) return String.fromCharCode(code + 0x1D41A - 97); // a-z
        return c; // অক্ষর না হলে একই রাখবে
      }).join("");

      const form = {
        body: `━━━━━━━━━━━━━━━━━━━━━
🛑 এই বলদ 😹 ${boldName}!  
_গ্রুপ থেকে লিভ নেওয়া কি মুখের কথা 😏
_যে গ্রুপে আমি থাকি..?? 🐸
_সেই গ্রুপ থেকে লিভ নেওয়া অসম্ভব ⚠️
🌀 আবার অ্যাড করে দিলাম 😇
━━━━━━━━━━━━━━━━━━━━━
👑 𝗕𝗼𝘁 𝗢𝘄𝗻𝗲𝗿 : 𝗔𝗸𝗮𝘀𝗵
━━━━━━━━━━━━━━━━━━━━━`
      };

      // ইউজারকে আবার গ্রুপে অ্যাড করে
      try {
        await api.addUserToGroup(leftID, threadID);
        await message.send(form);
      } catch (err) {
        message.send("⚠️ দুঃখিত, আমি ইউজারটাকে আবার অ্যাড করতে পারিনি। সম্ভবত অ্যাড ব্লক করা আছে।");
      }
    } 
    // কেউ কিক দিলে কিছু করবে না
    else return;
  }
};
