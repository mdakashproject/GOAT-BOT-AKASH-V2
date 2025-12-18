const axios = require("axios");

module.exports = {
  config: {
    name: "ffinfo",
    aliases: ["freefireinfo", "ffstats"],
    version: "2.0",
    author: "Dipto",
    role: 0,
    premium: false,
    description: "Show complete Free Fire player info with style",
    category: "game",
    guide: {
      en: "{p}ffinfo <uid>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const uid = args[0];
      if (!uid)
        return api.sendMessage(
          "⚠️ Please provide a Free Fire UID.\nExample: ffinfo 3060644273",
          event.threadID,
          event.messageID
        );

      const wait = await api.sendMessage("⏳ Fetching player info...", event.threadID);

      const url = `https://ff.mlbbai.com/info/?uid=${uid}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data.basicInfo)
        return api.editMessage("❌ Failed to fetch player data.", wait.messageID);

      const b = data.basicInfo;
      const clan = data.clanBasicInfo || {};
      const pet = data.petInfo || {};
      const social = data.socialInfo || {};
      const credit = data.creditScoreInfo || {};
      const cap = data.captainBasicInfo || {};

      const msg = `
━━━━━ 𝐅ʀᴇᴇ 𝐅ɪʀᴇ 𝐏ʟᴀʏᴇʀ 𝐈ɴꜰᴏ ━━━━━
❍ 𝐍ᴀᴍᴇ: ${b.nickname || "N/A"}
❍ 𝐔ɪᴅ: ${b.accountId || uid}
❍ 𝐑ᴇɢɪᴏɴ: ${b.region || "N/A"}
❍ 𝐋ᴇᴠᴇʟ: ${b.level || "N/A"}
❍ 𝐋ɪᴋᴇꜱ: ${b.liked || 0}
❍ 𝐄xᴘ: ${b.exp || 0}
❍ 𝐑ᴀɴᴋ: ${b.rank || "N/A"}
❍ 𝐑ᴀɴᴋ 𝐏ᴏɪɴᴛꜱ: ${b.rankingPoints || 0}
❍ 𝐂ꜱ 𝐑ᴀɴᴋ: ${b.csRank || "N/A"}
❍ 𝐂ꜱ 𝐏ᴏɪɴᴛꜱ: ${b.csRankingPoints || 0}
❍ 𝐌ᴀx 𝐑ᴀɴᴋ: ${b.maxRank || "N/A"}
❍ 𝐌ᴀx 𝐂ꜱ 𝐑ᴀɴᴋ: ${b.csMaxRank || "N/A"}
❍ 𝐄ʟɪᴛᴇ 𝐏ᴀꜱꜱ: ${b.hasElitePass ? "✅ Yes" : "❌ No"}
❍ 𝐁ᴀᴅɢᴇꜱ: ${b.badgeCnt || 0}
❍ 𝐒ᴇᴀꜱᴏɴ: ${b.seasonId || "N/A"}
❍ 𝐑ᴇʟᴇᴀꜱᴇ: ${b.releaseVersion || "N/A"}
❍ 𝐒ʜᴏᴡ 𝐁ʀ 𝐑ᴀɴᴋ: ${b.showBrRank ? "Yes" : "No"}
❍ 𝐒ʜᴏᴡ 𝐂ꜱ 𝐑ᴀɴᴋ: ${b.showCsRank ? "Yes" : "No"}
❍ 𝐀ᴄᴄᴏᴜɴᴛ 𝐂ʀᴇᴀᴛᴇ: ${new Date(b.createAt * 1000).toLocaleDateString("en-GB")}

━━━━━ 𝐂ʟᴀɴ 𝐈ɴꜰᴏ ━━━━━
❍ 𝐍ᴀᴍᴇ: ${clan.clanName || "None"}
❍ 𝐈ᴅ: ${clan.clanId || "N/A"}
❍ 𝐋ᴇᴠᴇʟ: ${clan.clanLevel || "N/A"}
❍ 𝐌ᴇᴍʙᴇʀꜱ: ${clan.memberNum || 0}/${clan.capacity || 0}
❍ 𝐂ᴀᴘᴛᴀɪɴ: ${cap.nickname || "N/A"} (Lv.${cap.level || "?"})

━━━━━ 𝐏ᴇᴛ 𝐈ɴꜰᴏ ━━━━━
❍ 𝐍ᴀᴍᴇ: ${pet.name || "None"}
❍ 𝐋ᴇᴠᴇʟ: ${pet.level || "N/A"}
❍ 𝐄xᴘ: ${pet.exp || 0}
❍ 𝐒ᴋɪɴ 𝐈ᴅ: ${pet.skinId || "N/A"}

━━━━━ 𝐒ᴏᴄɪᴀʟ 𝐈ɴꜰᴏ ━━━━━
❍ 𝐆ᴇɴᴅᴇʀ: ${social.gender?.replace("Gender_", "") || "N/A"}
❍ 𝐋ᴀɴɢᴜᴀɢᴇ: ${social.language?.replace("Language_", "") || "N/A"}
❍ 𝐒ɪɢɴᴀᴛᴜʀᴇ: ${social.signature ? social.signature.replace(/\[B]|\[C]|\[ff[0-9a-f]+]/g, "") : "None"}

━━━━━ 𝐂ʀᴇᴅɪᴛ 𝐒ᴄᴏʀᴇ ━━━━━
❍ 𝐒ᴄᴏʀᴇ: ${credit.creditScore || "N/A"}
❍ 𝐑ᴇᴡᴀʀᴅ: ${credit.rewardState?.replace("REWARD_STATE_", "") || "N/A"}
❍ 𝐏ᴇʀɪᴏᴅ 𝐄ɴᴅ: ${credit.periodicSummaryEndTime ? new Date(credit.periodicSummaryEndTime * 1000).toLocaleDateString("en-GB") : "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      await api.editMessage(msg, wait.messageID);
     
    } catch (e) {
      api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
  }
};
