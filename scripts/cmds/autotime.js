const moment = require("moment-timezone");

module.exports.config = {
  name: "autotime",
  version: "4.0.0",
  role: 0,
  author: "MOHAMMAD AKASH",
  description: "24H Bot-Style Auto Caption",
  category: "system",
};

module.exports.onLoad = async function ({ api }) {

  console.log("⏰ AutoTime Bot-Style 24H Loaded...");

  const captions = {
    "12:00 AM": "Late night silence",
    "01:00 AM": "Mind needs rest",
    "02:00 AM": "Slow down your thoughts",
    "03:00 AM": "Deep night feelings",
    "04:00 AM": "Almost a new morning",
    "05:00 AM": "First light of hope",
    "06:00 AM": "New day. New energy",
    "07:00 AM": "Fresh morning vibes",
    "08:00 AM": "Focus on yourself",
    "09:00 AM": "Move with purpose",
    "10:00 AM": "Positive energy only",
    "11:00 AM": "Calm mind wins",
    "12:00 PM": "Midday balance",
    "01:00 PM": "Slow moments matter",
    "02:00 PM": "Peace over pressure",
    "03:00 PM": "Soft afternoon light",
    "04:00 PM": "Pause. Breathe. Relax",
    "05:00 PM": "Evening begins",
    "06:00 PM": "Golden sunset mood",
    "07:00 PM": "Calm evening energy",
    "08:00 PM": "Pᴇᴀᴄᴇ ᴏᴠᴇʀ ᴇᴠᴇʀʏᴛʜɪɴɢ",
    "09:00 PM": "Night mode on",
    "10:00 PM": "Time to rest",
    "11:00 PM": "End the day softly"
  };

  const sendAutoTime = async () => {
    const now = moment().tz("Asia/Dhaka");
    const time = now.format("hh:mm A");
    const hour = parseInt(now.format("HH"));

    if (!captions[time]) return;

    const emoji = hour >= 18 || hour < 6 ? "🌙" : "☀️";

    const message =
`━━━━━━━━━━━━━━━━━━
⏰ ${time} ${emoji}
— ${captions[time]} ✨
━━━━━━━━━━━━━━━━━━`;

    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = threads.filter(t => t.isGroup);

      for (const thread of groups) {
        await api.sendMessage(message, thread.threadID);
      }

      console.log(`✅ Sent caption at ${time}`);
    } catch (err) {
      console.error("❌ AutoTime Error:", err);
    }
  };

  setInterval(sendAutoTime, 1000);
};

module.exports.onStart = () => {};
