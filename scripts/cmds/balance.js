const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

const balanceFile = __dirname + "/coinxbalance.json";

if (!fs.existsSync(balanceFile)) {
  fs.writeFileSync(balanceFile, JSON.stringify({}, null, 2));
}

function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(balanceFile));
  if (data[userID]?.balance != null) return data[userID].balance;
  if (userID === "100078049308655") return 10000;
  return 100;
}

function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(balanceFile));
  data[userID] = { balance };
  fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
}

// === Format Balance with Extended Units ===
function formatBalance(num) {
  if (num >= 1e33) return (num / 1e33).toFixed(1).replace(/\.0$/, '') + "De$"; // Decillion
  if (num >= 1e30) return (num / 1e30).toFixed(1).replace(/\.0$/, '') + "No$"; // Nonillion
  if (num >= 1e27) return (num / 1e27).toFixed(1).replace(/\.0$/, '') + "Oc$"; // Octillion
  if (num >= 1e24) return (num / 1e24).toFixed(1).replace(/\.0$/, '') + "Sp$"; // Septillion
  if (num >= 1e21) return (num / 1e21).toFixed(1).replace(/\.0$/, '') + "Sx$"; // Sextillion
  if (num >= 1e18) return (num / 1e18).toFixed(1).replace(/\.0$/, '') + "Qi$"; // Quintillion
  if (num >= 1e15) return (num / 1e15).toFixed(1).replace(/\.0$/, '') + "Qa$"; // Quadrillion
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + "T$";  // Trillion
  if (num >= 1e9) return  (num / 1e9).toFixed(1).replace(/\.0$/, '') + "B$";   // Billion
  if (num >= 1e6) return  (num / 1e6).toFixed(1).replace(/\.0$/, '') + "M$";   // Million
  if (num >= 1e3) return  (num / 1e3).toFixed(1).replace(/\.0$/, '') + "k$";   // Thousand
  return num + "$";
}

module.exports.config = {
  name: "balance",
  aliases: ["bal"],
  version: "1.1",
  author: "MOHAMMAD AKASH",
  countDown: 5,
  role: 0,
  shortDescription: "Bank card style balance",
  category: "game",
  guide: {
    en: "{p}balance\n{p}balance transfer @mention <amount>"
  }
};

module.exports.onStart = async function ({ api, event, args, usersData }) {
  const { threadID, senderID, messageID, mentions } = event;

  try {
    // === Transfer ===
    if (args[0] && args[0].toLowerCase() === "transfer") {
      if (!mentions || Object.keys(mentions).length === 0)
        return api.sendMessage("Please mention someone.", threadID, messageID);

      const targetID = Object.keys(mentions)[0];
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0)
        return api.sendMessage("Invalid amount.", threadID, messageID);

      let senderBal = getBalance(senderID);
      if (senderBal < amount)
        return api.sendMessage("Not enough balance.", threadID, messageID);

      let receiverBal = getBalance(targetID);
      senderBal -= amount;
      receiverBal += amount;
      setBalance(senderID, senderBal);
      setBalance(targetID, receiverBal);

      const senderName = await usersData.getName(senderID);
      const receiverName = await usersData.getName(targetID);

      return api.sendMessage(
        `Transfer Successful!\n${senderName} → ${receiverName}: ${formatBalance(amount)}\nYour balance: ${formatBalance(senderBal)}`,
        threadID, messageID
      );
    }

    // === Balance Card ===
    const balance = getBalance(senderID);
    const userName = await usersData.getName(senderID);
    const formatted = formatBalance(balance);

    // === Profile Pic ===
    const picUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    let avatar = null;
    try {
      const res = await axios({ url: picUrl, responseType: 'arraybuffer' });
      avatar = await loadImage(res.data);
    } catch (e) {}

    // === Canvas ===
    const width = 850;
    const height = 540;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, width, height, 35, true);

    // Glass Effect Overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, 20, 20, width - 40, height - 40, 30, true);

    // === Profile Picture (Top Right) ===
    if (avatar) {
      const size = 110;
      const x = width - size - 50;
      const y = 50;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, x, y, size, size);
      ctx.restore();

      // Glow Border
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2 + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // === Bank Name ===
    ctx.font = 'bold 38px "Segoe UI"';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('GOAT BANK', 60, 100);

    // === Card Number ===
    ctx.font = '32px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('•••• •••• •••• 8456', 60, 180);

    // === Card Holder ===
    ctx.font = 'bold 30px "Segoe UI"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(userName.toUpperCase(), 60, 250);

    // === Valid Thru ===
    ctx.font = '22px "Segoe UI"';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('VALID THRU', 60, 310);
    ctx.font = '28px "Segoe UI"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('12/28', 60, 350);

    // === Balance Box (Right Center) ===
    ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
    roundRect(ctx, 450, 180, 330, 180, 25, true);

    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 26px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('AVAILABLE BALANCE', 615, 230);

    ctx.font = 'bold 56px "Segoe UI"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(formatted, 615, 310);

    ctx.textAlign = 'left';

    // === Chip ===
    ctx.fillStyle = '#f4d03f';
    roundRect(ctx, 60, 400, 90, 65, 10, true);
    const chipPattern = [
      [15, 15], [45, 15], [75, 15],
      [15, 35], [45, 35], [75, 35],
      [15, 55], [45, 55], [75, 55]
    ];
    ctx.fillStyle = '#b7950b';
    chipPattern.forEach(([px, py]) => {
      ctx.fillRect(60 + px, 400 + py, 15, 15);
    });

    // === Visa Logo ===
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VISA', 180, 450);

    // === Contactless Symbol ===
    drawContactless(ctx, 300, 430);

    // === Save & Send ===
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(__dirname, 'cache', 'balance_perfect.png');
    if (!fs.existsSync(path.join(__dirname, 'cache'))) {
      fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);

    await api.sendMessage({
      body: "",
      attachment: fs.createReadStream(filePath)
    }, threadID, messageID);

    setTimeout(() => fs.unlinkSync(filePath), 10000);

  } catch (error) {
    console.error(error);
    api.sendMessage("Error generating card!", threadID, messageID);
  }
};

// Helper: Rounded Rect
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

// Contactless Symbol
function drawContactless(ctx, x, y) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(x, y, 15 * i, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
}
