const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

module.exports = {
    config: {
        name: "autolink",
        version: "1.1",
        author: "SaGor FIXED by Akash",
        countDown: 5,
        role: 0,
        shortDescription: "Auto-download & send videos with title (Improved)",
        category: "media",
    },

    onStart: async function () {},

    onChat: async function ({ api, event }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const message = event.body || "";

        // লিঙ্ক খুঁজে বের করা (একাধিক)
        const linkMatches = message.match(/(https?:\/\/[^\s]+)/g);
        if (!linkMatches || linkMatches.length === 0) return;

        // ডুপ্লিকেট রিমুভ
        const uniqueLinks = [...new Set(linkMatches)];

        // রিঅ্যাক্ট: প্রসেসিং শুরু
        api.setMessageReaction("⏳", messageID, () => {}, true);

        let successCount = 0;
        let failCount = 0;

        for (const url of uniqueLinks) {
            try {
                // লোডিং মেসেজ (বড় ভিডিওর জন্য)
                const loadingMsg = await api.sendMessage(
                    `⏳ ডাউনলোড হচ্ছে...\n🔗 ${url.substring(0, 50)}...`,
                    threadID
                );

                const { title, filePath } = await downloadVideo(url);
                if (!filePath || !fs.existsSync(filePath)) {
                    throw new Error("ফাইল ডাউনলোড হয়নি");
                }

                // ফাইল সাইজ চেক (25MB = 25 * 1024 * 1024 bytes)
                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 25) {
                    api.unsendMessage(loadingMsg.messageID);
                    api.sendMessage(
                        `❌ ভিডিও খুব বড় (${fileSizeInMB.toFixed(1)} MB)\n🔗 ${url}`,
                        threadID
                    );
                    fs.unlinkSync(filePath);
                    failCount++;
                    continue;
                }

                // সফল হলে পাঠানো
                await api.sendMessage(
                    {
                        body: `🎬 *${title || "ভিডিও"}*`,
                        attachment: fs.createReadStream(filePath)
                    },
                    threadID,
                    () => {
                        fs.unlinkSync(filePath); // ফাইল মুছে ফেলা
                    }
                );

                // লোডিং মেসেজ মুছে ফেলা
                api.unsendMessage(loadingMsg.messageID);
                successCount++;

            } catch (err) {
                failCount++;
                api.unsendMessage(loadingMsg?.messageID || "");
                api.sendMessage(
                    `❌ ডাউনলোড ফেল: ${err.message || "অজানা ত্রুটি"}\n🔗 ${url.substring(0, 50)}...`,
                    threadID
                );
            }
        }

        // ফাইনাল রিঅ্যাক্ট
        const finalReaction = successCount > 0 && failCount === 0 ? "✅" :
                              successCount > 0 ? "⚠️" : "❌";

        api.setMessageReaction(finalReaction, messageID, () => {}, true);

        // সারাংশ মেসেজ (ঐচ্ছিক)
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
