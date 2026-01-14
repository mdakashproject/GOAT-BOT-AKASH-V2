const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "autolink",
        version: "1.3",
        author: "MOHAMMAD AKASH",
        role: 0,
        shortDescription: "Auto-download videos via Akash-video-downloader API",
        category: "media",
        countDown: 3,
    },

    onStart: async function({ api, event }) {
        // Required by Goat Bot v2
    },

    onChat: async function({ api, event }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const message = event.body || "";

        const linkMatches = message.match(/(https?:\/\/[^\s]+)/g);
        if (!linkMatches || linkMatches.length === 0) return;

        const uniqueLinks = [...new Set(linkMatches)];

        api.setMessageReaction("⏳", messageID, () => {}, true);

        let successCount = 0;
        let failCount = 0;

        for (const url of uniqueLinks) {
            try {
                const response = await axios.post(
                    "https://akash-video-downloader.onrender.com/download",
                    { url },
                    { responseType: "stream" }
                );

                const tempFile = path.join(__dirname, `temp_${Date.now()}.mp4`);
                const writer = fs.createWriteStream(tempFile);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });

                const stats = fs.statSync(tempFile);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 25) {
                    fs.unlinkSync(tempFile);
                    failCount++;
                    continue;
                }

                await api.sendMessage(
                    {
                        body: `📥 Video downloaded successfully\n━━━━━━━━━━━━━━━`,
                        attachment: fs.createReadStream(tempFile)
                    },
                    threadID,
                    () => fs.unlinkSync(tempFile)
                );

                successCount++;

            } catch (err) {
                failCount++;
            }
        }

        const finalReaction =
            successCount > 0 && failCount === 0 ? "✅" :
            successCount > 0 ? "⚠️" : "❌";

        api.setMessageReaction(finalReaction, messageID, () => {}, true);
    }
};
