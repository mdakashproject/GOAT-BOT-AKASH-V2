const axios = require('axios');

module.exports = {
  config: {
    name: "ffinfo",
    version: "1.0",
    author: "MOHAMMAD AKASH",
    countDown: 10,
    role: 0,
    shortDescription: "Get Free Fire Player Info by UID",
    longDescription: "Enter a Free Fire UID to view full profile stats! 🔥",
    category: "ff",
    guide: "{pn}ffinfo [UID] | Example: /ffinfo 2099807760"
  },

  onStart: async function ({ message, event, args }) {
    const uid = args.join(" ").trim();

    if (!uid || isNaN(uid)) {
      return message.reply("❌ Invalid! Please enter a valid UID.\nExample: /ffinfo 2099807760");
    }

    const region = "BD"; // Change region if needed: BD / IND / SG
    const apiUrl = `https://info-ob49.vercel.app/api/account/?uid=${uid}&region=${region}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.basicInfo || data.error) {
        return message.reply(`❌ Player with UID ${uid} not found!\nTry correct region (BD/IND/SG).`);
      }

      const basic = data.basicInfo;
      const profile = data.profileInfo || {};
      const clan = data.clanBasicInfo || { clanName: "No Clan" };

      const winRate = basic.totalMatches > 0 
        ? ((basic.wins / basic.totalMatches) * 100).toFixed(2) 
        : "0.00";

      const msg = `
╭────────────────────❖
│ 🔥 𝙵𝚁𝙴𝙴 𝙵𝙸𝚁𝙴 𝙿𝙻𝙰𝚈𝙴𝚁 𝙸𝙽𝙵𝙾 🔥
├──────────────────────────────
│ 🆔 𝚄𝙸𝙳: ${basic.accountId || uid}
│ 👤 𝙽𝚊𝚖𝚎: ${basic.nickname || "Unknown"}
│ 📊 𝙻𝚎𝚟𝚎𝚕: ${basic.level || "N/A"}
│ 🏆 𝚁𝚊𝚗𝚔: ${basic.rank || "N/A"} (${basic.rankPoints || "N/A"} 𝚁𝙿)
│ 💀 𝚃𝚘𝚝𝚊𝚕 𝙺𝚒𝚕𝚕𝚜: ${basic.totalKills || "N/A"}
│ 🎯 𝙷𝚎𝚊𝚍𝚜𝚑𝚘𝚝 𝚁𝚊𝚝𝚎: ${(basic.headshotRate || 0).toFixed(2)}%
│ ⚔️ 𝙼𝚊𝚝𝚌𝚑𝚎𝚜 𝙿𝚕𝚊𝚢𝚎𝚍: ${basic.totalMatches || "N/A"}
│ 🏅 𝚆𝚒𝚗 𝚁𝚊𝚝𝚎: ${winRate}%
├──────────────────────────────
│ 👥 𝙲𝚕𝚊𝚗: ${clan.clanName || "N/A"} (𝙸𝙳: ${clan.clanId || "N/A"})
│ 🐶 𝙿𝚎𝚝: ${profile.petId || "N/A"}
│ 🎨 𝙰𝚟𝚊𝚝𝚊𝚛 𝙸𝙳: ${profile.avatarId || "N/A"}
├──────────────────────────────
│ 🔗 𝙿𝚛𝚘𝚏𝚒𝚕𝚎: https://ff.garena.com/profile?uid=${uid}
│ 📅 𝚄𝚙𝚍𝚊𝚝𝚎𝚍: ${new Date().toLocaleDateString('en-GB')}
╰────────────────────❖
👑 𝙲𝚛𝚎𝚊𝚝𝚘𝚛: 𝙼𝙾𝙷𝙰𝙼𝙼𝙰𝙳 𝙰𝙺𝙰𝚂𝙷
      `.trim();

      await message.reply(msg);
      await message.reaction("🔥", event.messageID);

    } catch (error) {
      console.error("API Error:", error.message);
      await message.reply(`❌ Error loading UID ${uid}.\nTry again later or check region.\n\n${error.message}`);
    }
  }
};
