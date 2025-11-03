const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "emoji_voice",
    version: "1.0.2",
    author: "Mohammad Akash (Fixed by GPT-5)",
    countDown: 5,
    role: 0,
    shortDescription: "ইমোজি দিলে কিউট মেয়ের ভয়েস পাঠাবে 😍",
    longDescription: "যে কোনো নির্দিষ্ট ইমোজি পাঠালে কিউট ভয়েস মেসেজ পাঠাবে 😘",
    category: "noPrefix"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    const { body } = event;
    if (!body || body.length > 2) return;

    const emojiAudioMap = {
      "🥱": "https://files.catbox.moe/9pou40.mp3",
      "😁": "https://files.catbox.moe/60cwcg.mp3",
      "😌": "https://files.catbox.moe/epqwbx.mp3",
      "🥺": "https://files.catbox.moe/wc17iq.mp3",
      "🤭": "https://files.catbox.moe/cu0mpy.mp3",
      "😅": "https://files.catbox.moe/jl3pzb.mp3",
      "😏": "https://files.catbox.moe/z9e52r.mp3",
      "😞": "https://files.catbox.moe/tdimtx.mp3",
      "🤫": "https://files.catbox.moe/0uii99.mp3",
      "🍼": "https://files.catbox.moe/p6ht91.mp3",
      "🤔": "https://files.catbox.moe/hy6m6w.mp3",
      "🥰": "https://files.catbox.moe/dv9why.mp3",
      "🤦": "https://files.catbox.moe/ivlvoq.mp3",
      "😘": "https://files.catbox.moe/sbws0w.mp3",
      "😑": "https://files.catbox.moe/p78xfw.mp3",
      "😢": "https://files.catbox.moe/shxwj1.mp3",
      "🙊": "https://files.catbox.moe/3bejxv.mp3",
      "🤨": "https://files.catbox.moe/4aci0r.mp3",
      "😡": "https://files.catbox.moe/shxwj1.mp3",
      "🙈": "https://files.catbox.moe/3qc90y.mp3",
      "😍": "https://files.catbox.moe/qjfk1b.mp3",
      "😭": "https://files.catbox.moe/itm4g0.mp3",
      "😱": "https://files.catbox.moe/mu0kka.mp3",
      "😻": "https://files.catbox.moe/y8ul2j.mp3",
      "😿": "https://files.catbox.moe/tqxemm.mp3",
      "💔": "https://files.catbox.moe/6yanv3.mp3",
      "🤣": "https://files.catbox.moe/2sweut.mp3",
      "🥹": "https://files.catbox.moe/jf85xe.mp3",
      "😩": "https://files.catbox.moe/b4m5aj.mp3",
      "🫣": "https://files.catbox.moe/ttb6hi.mp3",
      "🐸": "https://files.catbox.moe/utl83s.mp3",
      "💋": "https://files.catbox.moe/37dqpx.mp3",
      "🫦": "https://files.catbox.moe/61w3i0.mp3",
      "😴": "https://files.catbox.moe/rm5ozj.mp3",
      "🙏": "https://files.catbox.moe/7avi7u.mp3",
      "😼": "https://files.catbox.moe/4oz916.mp3",
      "🖕": "https://files.catbox.moe/593u3j.mp3",
      "🥵": "https://files.catbox.moe/l90704.mp3",
      "🙂": "https://files.catbox.moe/mt5il0.mp3",
      "😒": "https://files.catbox.moe/mt5il0.mp3",
      "😓": "https://files.catbox.moe/zh3mdg.mp3",
      "🤧": "https://files.catbox.moe/zh3mdg.mp3"
    };

    const emoji = body.trim();
    const audioUrl = emojiAudioMap[emoji];
    if (!audioUrl) return;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const filePath = path.join(cacheDir, `${encodeURIComponent(emoji)}.mp3`);

    try {
      const response = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      await message.reply({
        attachment: fs.createReadStream(filePath)
      });

      fs.unlink(filePath);
    } catch (error) {
      console.error(error);
      message.reply("ইমুজি দিয়ে লাভ নাই 😒\nযাও মুড়ি খাও জান 😘");
    }
  }
};
