const axios = require("axios");

const apikey = "66e0cfbb-62b8-4829-90c7-c78cacc72ae2";

module.exports = {
  config: {
    name: "imgbb",
    version: "1.0",
    author: "nexo_here",
    category: "tools",
    shortDescription: "Upload replied image to imgbb & get link",
    longDescription: "Reply to an image with this command to get its imgbb link",
    guide: "{pn}imgbb (reply to an image)"
  },

  onStart: async function ({ api, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage("❌ Please reply to an image.", event.threadID, event.messageID);
      }

      const imageUrl = event.messageReply.attachments[0].url;
      const apiUrl = `https://kaiz-apis.gleeze.com/api/imgbb?url=${encodeURIComponent(imageUrl)}&apikey=${apikey}`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.success && data.link) {
        return api.sendMessage(`✅ Uploaded successfully!\n\nLink:\n${data.link}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("❌ Upload failed.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("imgbb command error:", error);
      return api.sendMessage("❌ Something went wrong.", event.threadID, event.messageID);
    }
  }
};