const axios = require("axios");

module.exports = {
  config: {
    name: "drive",
    version: "1.0.0",
    author: "ArYAN | Modified by Mohammad Akash",
    countDown: 5,
    role: 2,
    shortDescription: "Upload media to Google Drive",
    longDescription: "Reply to any video/image/audio or give a direct media URL to upload it to Google Drive and get a sharable link.",
    category: "media",
  },

  onStart: async function ({ api, event, args }) {
    let inputUrl = null;

    // ✅ Reply attachment বা args থেকে URL নেওয়া
    if (event.messageReply?.attachments?.length > 0) {
      inputUrl = event.messageReply.attachments[0].url;
    } else if (args.length > 0) {
      inputUrl = args[0];
    }

    // ⚠️ যদি URL না দেয়
    if (!inputUrl) {
      return api.sendMessage(
        "❌ | দয়া করে কোনো মিডিয়া রিপ্লাই করো বা সোজা URL দাও!",
        event.threadID,
        event.messageID
      );
    }

    const apikey = "ArYAN";
    const apiURL = `https://aryan-xyz-google-drive.vercel.app/drive?url=${encodeURIComponent(inputUrl)}&apikey=${apikey}`;

    try {
      // 🔄 আপলোড হচ্ছে মেসেজ
      await api.sendMessage("☁️ Google Drive-এ আপলোড হচ্ছে, একটু অপেক্ষা করো...", event.threadID);

      const res = await axios.get(apiURL);
      const data = res.data || {};
      const driveLink = data.driveLink || data.driveLIink;

      // ✅ সফল হলে
      if (driveLink) {
        return api.sendMessage(
          `✅ 𝙵𝚒𝚕𝚎 সফলভাবে আপলোড হয়েছে!\n\n🔗 Google Drive URL:\n${driveLink}\n\n👤 Uploaded by: 𝙼𝚘𝚑𝚊𝚖𝚖𝚊𝚍 𝙰𝚔𝚊𝚜𝚑`,
          event.threadID,
          event.messageID
        );
      }

      // ❌ ব্যর্থ হলে
      return api.sendMessage(
        `❌ | ফাইল আপলোড ব্যর্থ!\n${data.error || "অজানা কোনো ত্রুটি ঘটেছে।"}`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error("Google Drive Upload Error:", error.message);
      return api.sendMessage(
        "⚠️ | কিছু সমস্যা হয়েছে আপলোডের সময়। আবার চেষ্টা করো!",
        event.threadID,
        event.messageID
      );
    }
  },
};
