const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

module.exports = {
    config: {
        name: "autolink",
        version: "1.3",
        author: "MOHAMMAD AKASH",
        countDown: 5,
        role: 0,
        shortDescription: "Auto-download & send videos silently (no messages)",
        category: "media",
    },

    onStart: async function () {},

    onChat: async function ({ api, event }) {
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
                const { title, filePath } = await downloadVideo(url);
                if (!filePath || !fs.existsSync(filePath)) throw new Error();

                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 25) {
                    fs.unlinkSync(filePath);
                    failCount++;
                    continue;
                }

                await api.sendMessage(
                    {
                        body: `🎬 *${title || "ভিডিও"}*`,
                        attachment: fs.createReadStream(filePath)
                    },
                    threadID,
                    () => fs.unlinkSync(filePath)
                );

                successCount++;

            } catch {
                failCount++;
                // কোনো এরর মেসেজ পাঠাবে না
            }
        }

        const finalReaction =
            successCount > 0 && failCount === 0 ? "✅" :
            successCount > 0 ? "⚠️" : "❌";

        api.setMessageReaction(finalReaction, messageID, () => {}, true);

        // সারাংশ মেসেজ চাইলে নিচেরটা অন রাখো, না চাইলে কমেন্ট করে দিও ↓
        if (uniqueLinks.length > 1) {
            setTimeout(() => {
                api.sendMessage(
                    `📊 সারাংশ: ✅ ${successCount} সফল | ❌ ${failCount} ব্যর্থ`,
                    threadID
                );
            }, 2000);
        }
    }
};
