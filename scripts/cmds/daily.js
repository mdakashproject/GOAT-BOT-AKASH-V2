const axios = require("axios");

// API URL
const API_URL = "https://balance-bot-api.onrender.com";

// Daily bonus tracker (memory-based)
if (!global.dailyBonus) global.dailyBonus = {};

// Fetch balance
async function getBalance(userID) {
  try {
    const res = await axios.get(`${API_URL}/api/balance/${userID}`);
    return res.data.balance || 100;
  } catch {
    return 100;
  }
}

// Add balance
async function addBalance(userID, amount) {
  try {
    const res = await axios.post(`${API_URL}/api/balance/add`, { userID, amount });
    return res.data.success ? res.data.balance : null;
  } catch {
    return null;
  }
}

// Format currency
function formatBalance(num) { return num.toLocaleString("en-US") + " $"; }

// Create stylish daily bonus message
function createMessage(userName, amount, newBalance) {
  return `🎁 Dᴀɪʟʏ Bᴏɴᴜs 🎁

👤 Pʟᴀʏᴇʀ: ${userName}
💵 Bᴏɴᴜs: ${formatBalance(amount)}
💳 Nᴇᴡ Bᴀʟᴀɴᴄᴇ: ${formatBalance(newBalance)}

⏰ Cᴏᴍᴇ ʙᴀᴄᴋ ᴛᴏᴍᴏʀʀᴏᴡ ғᴏʀ ᴍᴏʀᴇ!`;
}

// Module config
module.exports.config = {
  name: "daily",
  version: "1.0",
  author: "MOHAMMAD AKASH",
  role: 0,
  shortDescription: "Claim daily bonus",
  category: "economy"
};

// On start
module.exports.onStart = async function({ api, event, usersData }) {
  const { threadID, senderID } = event;
  const userName = await usersData.getName(senderID);

  const now = Date.now();
  const lastClaim = global.dailyBonus[senderID] || 0;
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours

  // Check cooldown
  if(now - lastClaim < oneDay) {
    const nextTime = new Date(lastClaim + oneDay);
    return api.sendMessage(`⏰ Yᴏᴜ ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ʏᴏᴜʀ Dᴀɪʟʏ Bᴏɴᴜs!\nNᴇxᴛ Bᴏɴᴜs: ${nextTime.toLocaleTimeString()}`, threadID);
  }

  // Random daily bonus between 50$ and 500$
  const bonusAmount = Math.floor(Math.random() * (500 - 50 + 1) + 50);

  // Update balance
  const newBalance = await addBalance(senderID, bonusAmount);
  if(!newBalance) return api.sendMessage("❌ Eʀʀᴏʀ ᴜᴘᴅᴀᴛɪɴɢ Bᴀʟᴀɴᴄᴇ. Tʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.", threadID);

  // Update last claim
  global.dailyBonus[senderID] = now;

  // Send stylish message
  const message = createMessage(userName, bonusAmount, newBalance);
  await api.sendMessage(message, threadID);
};
