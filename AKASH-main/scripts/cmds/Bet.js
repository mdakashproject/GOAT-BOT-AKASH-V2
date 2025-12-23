const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

const balanceFile = path.join(__dirname, "coinxbalance.json");
if (!fs.existsSync(balanceFile)) {
  fs.writeFileSync(balanceFile, JSON.stringify({}, null, 2));
}

function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(balanceFile));
  if (data[userID]?.balance != null) return data[userID].balance;
  return userID === "100078049308655" ? 10000 : 100;
}

function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(balanceFile));
  data[userID] = { balance };
  fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
}

function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + "k$";
  return num + "$";
}

function parseAmount(str) {
  str = str.toLowerCase().replace(/\s+/g, '');
  const match = str.match(/^([\d.]+)([kmbt]?)$/);
  if (!match) return NaN;
  let num = parseFloat(match[1]);
  const unit = match[2];
  switch (unit) {
    case 'k': num *= 1e3; break;
    case 'm': num *= 1e6; break;
    case 'b': num *= 1e9; break;
    case 't': num *= 1e12; break;
  }
  return Math.floor(num);
}

module.exports.config = {
  name: "bet",
  version: "2.0",
  author: "MOHAMMAD AKASH",
  countDown: 5,
  role: 0,
  shortDescription: "Casino-style bet with image result",
  category: "game",
  guide: { en: "{p}bet <amount> — e.g. bet 1k" }
};

module.exports.onStart = async function ({ api, event, args, usersData }) {
  const { senderID, threadID, messageID } = event;

  try {
    let balance = getBalance(senderID);

    if (!args[0])
      return api.sendMessage("Please enter amount: bet 500 / bet 1k", threadID, messageID);

    const betAmount = parseAmount(args[0]);
    if (isNaN(betAmount) || betAmount <= 0)
      return api.sendMessage("Invalid amount!", threadID, messageID);

    if (betAmount > balance)
      return api.sendMessage(`Not enough coins!\nBalance: ${formatBalance(balance)}`, threadID, messageID);

    const multipliers = [3, 4, 8, 20, 50];
    const chosenMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const win = Math.random() < 0.5;

    let newBalance = balance;
    let resultText = "", profit = 0;

    if (win) {
      profit = betAmount * chosenMultiplier;
      newBalance += profit;
      resultText = `JACKPOT! ${chosenMultiplier}x`;
    } else {
      newBalance -= betAmount;
      if (newBalance < 0) newBalance = 0;
      resultText = "TRY AGAIN";
    }
    setBalance(senderID, newBalance);

    // === Generate Casino Card ===
    const userName = await usersData.getName(senderID);
    const avatarUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    let avatar;
    try {
      const res = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      avatar = await loadImage(res.data);
    } catch (e) {
      avatar = null;
    }

    const filePath = await generateCasinoCard({
      userName,
      avatar,
      betAmount,
      resultText,
      multiplier: win ? chosenMultiplier : null,
      profit: win ? profit : betAmount,
      oldBalance: balance,
      newBalance,
      win
    });

    await api.sendMessage({
      body: "",
      attachment: fs.createReadStream(filePath)
    }, threadID, messageID);

    setTimeout(() => fs.existsSync(filePath) && fs.unlinkSync(filePath), 10000);

  } catch (error) {
    console.error(error);
    api.sendMessage("Error in bet command.", threadID, messageID);
  }
};

// === Generate Casino Image ===
async function generateCasinoCard(data) {
  const width = 900;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0f0f23');
  bgGrad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Neon Border
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 8;
  roundRect(ctx, 20, 20, width - 40, height - 40, 30, false, true);

  // Casino Title
  ctx.font = 'bold 60px "Arial Black"';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff4500';
  ctx.shadowBlur = 20;
  ctx.fillText('GOAT CASINO', width / 2, 100);
  ctx.shadowColor = 'transparent';

  // Profile Pic
  if (data.avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 200, 70, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(data.avatar, 50, 130, 140, 140);
    ctx.restore();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  // Player Name
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(data.userName, 230, 190);

  // Bet Amount
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#00ffcc';
  ctx.fillText(`Bet: ${formatBalance(data.betAmount)}`, 230, 240);

  // Result Box
  ctx.fillStyle = data.win ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
  roundRect(ctx, 230, 280, 430, 180, 25, true);

  // Result Text
  ctx.font = 'bold 56px Arial';
  ctx.fillStyle = data.win ? '#00ff00' : '#ff0000';
  ctx.textAlign = 'center';
  ctx.fillText(data.resultText, width / 2, 360);

  if (data.win) {
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`${data.multiplier}x MULTIPLIER`, width / 2, 420);
  }

  // Profit / Loss
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = data.win ? '#00ff00' : '#ff4444';
  ctx.fillText(data.win ? `+${formatBalance(data.profit)}` : `-${formatBalance(data.betAmount)}`, width / 2, 500);

  // Balance
  ctx.font = '28px Arial';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`Balance: ${formatBalance(data.newBalance)}`, width / 2, 550);

  // Chips Animation (Decorative)
  drawChips(ctx, 700, 150, data.win ? '#ffd700' : '#888');

  // Save
  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const filePath = path.join(cacheDir, `bet_${Date.now()}.png`);
  fs.writeFileSync(filePath, canvas.toBuffer());
  return filePath;
}

function roundRect(ctx, x, y, w, h, r, fill = false, stroke = false) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawChips(ctx, x, y, color) {
  const chips = [
    { x: 0, y: 0, r: 30 },
    { x: 40, y: -20, r: 25 },
    { x: -30, y: 15, r: 28 }
  ];
  chips.forEach(chip => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + chip.x, y + chip.y, chip.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('$', x + chip.x, y + chip.y + 6);
  });
}
