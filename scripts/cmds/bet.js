const axios = require("axios");

const API_URL = "https://balance-bot-api.onrender.com";
const MIN_BET = 10;

if (!global.slotGames) global.slotGames = {};

/* ========== HELPERS ========== */

const SYMBOLS = ["🍒", "🍋", "🍉", "🍇", "⭐", "🔔"];

function randSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function format(num) {
  return num.toLocaleString("en-US") + " $";
}

async function getBalance(uid) {
  try {
    const r = await axios.get(`${API_URL}/api/balance/${uid}`);
    return r.data.balance || 100;
  } catch {
    return 100;
  }
}

async function lose(uid, amount) {
  try {
    await axios.post(`${API_URL}/api/balance/lose`, { userID: uid, amount });
    return true;
  } catch {
    return false;
  }
}

async function win(uid, amount) {
  try {
    const r = await axios.post(`${API_URL}/api/balance/win`, { userID: uid, amount });
    return r.data.balance;
  } catch {
    return null;
  }
}

/* ========== CONFIG ========== */

module.exports.config = {
  name: "slot",
  aliases: ["slots"],
  version: "1.0",
  author: "Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
  role: 0,
  shortDescription: "Slot Machine Game",
  category: "economy",
  guide: { en: "{p}slot <amount>" }
};

/* ========== COMMAND ========== */

module.exports.onStart = async function ({ api, event, args, usersData }) {
  const { senderID, threadID, messageID } = event;

  const bet = Number(args[0]);
  if (!bet || bet < MIN_BET)
    return api.sendMessage(`❌ Mɪɴɪᴍᴜᴍ Bᴇᴛ: ${MIN_BET} $`, threadID, messageID);

  const balance = await getBalance(senderID);
  if (bet > balance)
    return api.sendMessage(`❌ Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ\n💰 ${format(balance)}`, threadID, messageID);

  if (!(await lose(senderID, bet)))
    return api.sendMessage("❌ Bᴇᴛ Fᴀɪʟᴇᴅ", threadID, messageID);

  // Pre-generate final result
  const finalSlots = [randSymbol(), randSymbol(), randSymbol()];
  const isWin = finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2];
  const multiplier = isWin ? 5 : 0;
  const winAmount = bet * multiplier;

  const msg = await api.sendMessage(
    `🎰 Sʟᴏᴛ Mᴀᴄʜɪɴᴇ 🎰\n\n[ ❓ | ❓ | ❓ ]\n\nSᴘɪɴɴɪɴɢ...`,
    threadID
  );

  let step = 0;
  let slots = ["❓", "❓", "❓"];

  const interval = setInterval(async () => {
    step++;

    // 1–4 animation edits
    if (step <= 4) {
      slots[step - 1] = finalSlots[step - 1] || randSymbol();

      await api.editMessage(
        `🎰 Sʟᴏᴛ Mᴀᴄʜɪɴᴇ 🎰\n\n[ ${slots.join(" | ")} ]\n\nSᴘɪɴɴɪɴɢ...`,
        msg.messageID,
        threadID
      );
      return;
    }

    // 5th edit → FINAL RESULT
    clearInterval(interval);

    if (isWin) {
      const newBal = await win(senderID, winAmount);
      return api.editMessage(
        `🎰 Sʟᴏᴛ Mᴀᴄʜɪɴᴇ 🎰\n\n[ ${finalSlots.join(" | ")} ]\n\n🏆 Jᴀᴄᴋᴘᴏᴛ!\n×${multiplier} Wɪɴ\n\n💰 Bᴇᴛ: ${format(bet)}\n🏆 Wɪɴ: ${format(winAmount)}`,
        msg.messageID,
        threadID
      );
    } else {
      return api.editMessage(
        `🎰 Sʟᴏᴛ Mᴀᴄʜɪɴᴇ 🎰\n\n[ ${finalSlots.join(" | ")} ]\n\n💀 Lᴏss\n\n💰 Bᴇᴛ: ${format(bet)}\n❌ Wɪɴ: 0 $`,
        msg.messageID,
        threadID
      );
    }
  }, 1000);
};
