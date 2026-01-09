const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "catbox",
    version: "1.0.1",
    author: "MOHAMMAD AKASH",
    role: 0,
    shortDescription: "Upload media to Catbox",
    longDescription: "Reply to an image, video, or audio file to upload it to Catbox and get the link.",
    category: "media",
    guide: "[reply to image/video/audio]",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, type, messageReply, messageID } = event;

    if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
      return api.sendMessage("❐ Please reply to a photo/video/audio file.", threadID, messageID);
    }

    const attachmentPaths = [];

    // Download attachments
    async function downloadAttachment(url, filename) {
      const writer = fs.createWriteStream(filename);
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream"
      });
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    let index = 0;
    for (const data of messageReply.attachments) {
      const ext = data.type === "photo" ? "jpg" :
                  data.type === "video" ? "mp4" :
                  data.type === "audio" ? "mp3" :
                  data.type === "animated_image" ? "gif" : "dat";
      const filePath = path.join(__dirname, `cache_${Date.now()}_${index}.${ext}`);
      await downloadAttachment(data.url, filePath);
      attachmentPaths.push(filePath);
      index++;
    }

    let msg = "";

    for (const filePath of attachmentPaths) {
      try {
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fs.createReadStream(filePath));

        const response = await axios.post("https://catbox.moe/user/api.php", form, {
          headers: form.getHeaders(),
        });

        msg += `${response.data.trim()}\n`;
      } catch (err) {
        console.error("Catbox upload failed:", err);
        msg += "❌ Upload failed for one file.\n";
      } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    return api.sendMessage(msg.trim(), threadID, messageID);
  }
};
