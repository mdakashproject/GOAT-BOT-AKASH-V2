const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const { createCanvas, loadImage } = require("canvas");

const balancePath = __dirname + "/coinxbalance.json";
if (!fs.existsSync(balancePath))
  fs.writeFileSync(balancePath, JSON.stringify({}, null, 2));

function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(balancePath));
  if (data[userID]?.balance != null) return data[userID].balance;
  if (userID === "100078049308655") return 10000;
  return 100;
}

function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(balancePath));
  data[userID] = { balance };
  fs.writeFileSync(balancePath, JSON.stringify(data, null, 2));
}

// DP loader
async function loadUserDP(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    const buffer = await fetch(url).then(res => res.arrayBuffer());
    return await loadImage(Buffer.from(buffer));
  } catch (e) {
    return await loadImage("https://i.postimg.cc/kgjgP6QX/messenger-dp.png");
  }
}

// Bubble drawer
function drawBubble(ctx, x, y, w, h, color, tailLeft = true) {
  const radius = 40;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();

  if (tailLeft) {
    ctx.beginPath();
    ctx.moveTo(x, y + 60);
    ctx.lineTo(x - 38, y + 90);
    ctx.lineTo(x, y + 120);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + w, y + 60);
    ctx.lineTo(x + w + 38, y + 90);
    ctx.lineTo(x + w, y + 120);
    ctx.closePath();
    ctx.fill();
  }
}

module.exports = {
  config: {
    name: "fakechat",
    aliases: ["fchat"],
    version: "9.0",
    author: "MOHAMMAD AKASH",
    role: 0,
    countDown: 5,
    shortDescription: { en: "Messenger FakeChat Dark Mode (Big Light Font)" },
    category: "fun",
    guide: { en: "+fakechat @mention - msg1 - [msg2]" }
  },

  onStart: async function ({ args, message, event, api }) {
    if (args.length < 2)
      return message.reply("Usage:\n+fakechat @mention - msg1 - msg2");

    const input = args.join(" ").split("-").map(a => a.trim());
    let [target, text1, text2 = ""] = input;

    let uid;
    if (event.mentions && Object.keys(event.mentions).length > 0)
      uid = Object.keys(event.mentions)[0];
    else if (/^\d{6,}$/.test(target)) uid = target;
    else return message.reply("❌ Invalid UID!");

    let name = "User";
    try {
      const info = await api.getUserInfo(uid);
      name = info[uid]?.name || "User";
    } catch {}

    // Balance
    const senderID = event.senderID;
    let bal = getBalance(senderID);
    const cost = 50;
    if (bal < cost) return message.reply("❌ Not enough balance");
    setBalance(senderID, bal - cost);

    // Load DP
    const dp = await loadUserDP(uid);

    // Canvas
    const width = 1080, height = 1500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Dark background
    ctx.fillStyle = "#18191A";
    ctx.fillRect(0, 0, width, height);

    // Draw DP
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 180, 90, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(dp, 30, 90, 180, 180);
    ctx.restore();

    // Name & time
    ctx.fillStyle = "#fff";
    ctx.font = "300 55px Sans-serif"; // light & bigger font
    ctx.fillText(name, 250, 160);
    ctx.fillStyle = "#aaa";
    ctx.font = "300 40px Sans-serif"; // light & smaller for status
    ctx.fillText("Active now", 250, 210);

    // Left bubble = Receiver (dark grey)
    drawBubble(ctx, 50, 280, 700, 150, "#242526", true);
    ctx.fillStyle = "#fff";
    ctx.font = "300 55px Sans-serif";
    ctx.fillText(text1, 90, 370);

    // Right bubble = Sender (blue)
    if (text2) {
      const bubbleX = width - 50 - 700;
      drawBubble(ctx, bubbleX, 480, 700, 150, "#0560FF", false);
      ctx.fillStyle = "#fff";
      ctx.font = "300 55px Sans-serif";
      ctx.fillText(text2, bubbleX + 40, 570);
    }

    const imgPath = path.join(__dirname, "tmp", `fakechat_${senderID}.png`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, canvas.toBuffer());

    // Only send image
    message.reply({ attachment: fs.createReadStream(imgPath) }, () => fs.unlinkSync(imgPath));
  }
};
