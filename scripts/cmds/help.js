const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "5.0",
    author: "MOHAMMAD AKASH",
    shortDescription: "Aʙᴄ 𝙎𝙝𝙤𝙬 𝙖𝙡𝙡 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨",
    longDescription: "Aʙᴄ 𝘿𝙞𝙨𝙥𝙡𝙖𝙮𝙨 𝙖 𝙛𝙤𝙣𝙩-𝙨𝙩𝙮𝙡𝙚ᴅ 𝙘𝙖𝙩𝙚𝙜𝙤ʀɪᴢᴇᴅ 𝙘𝙤𝙢ᴍᴀɴᴅ 𝙢ᴇɴᴜ.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    // Aʙᴄ ফন্ট কনভার্টার
    const fontMap = {
      A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", G: "G", H: "H", I: "I", J: "J",
      K: "K", L: "L", M: "M", N: "N", O: "O", P: "P", Q: "Q", R: "R", S: "S",
      T: "T", U: "U", V: "V", W: "W", X: "X", Y: "Y", Z: "Z",
      a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ",
      k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s",
      t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ"
    };
    const fancy = (str) => str.replace(/[A-Za-z]/g, (c) => fontMap[c] || c);

    const emojiMap = {
      ai: "🤖", "ai-image": "🎨", group: "👥", system: "⚙️",
      fun: "😂", owner: "👑", config: "🧠", economy: "💰",
      media: "🎬", "18+": "🔞", tools: "🛠", utility: "🧰",
      info: "ℹ️", image: "🖼️", game: "🎮", admin: "🛡️",
      rank: "📈", boxchat: "💬", others: "📁"
    };

    const cleanCategoryName = (text) => {
      if (!text) return "others";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    for (const [name, cmd] of allCommands) {
      const cat = cleanCategoryName(cmd.config.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    const gifURLs = [
      "https://i.imgur.com/3tBIaSF.gif",
      "https://i.imgur.com/vWl3Tb5.gif",
      "https://i.imgur.com/DYfouuR.gif"
    ];

    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
    const gifFolder = path.join(__dirname, "cache");
    if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });
    const gifName = path.basename(randomGifURL);
    const gifPath = path.join(gifFolder, gifName);
    if (!fs.existsSync(gifPath)) await downloadGif(randomGifURL, gifPath);

    // একক কমান্ড ডিটেইল
    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find((c) => (c.config.aliases || []).includes(query));
      if (!cmd) return message.reply(`❌ ${fancy(`Command "${query}" not found.`)}`);

      const {
        name,
        version,
        author,
        guide,
        category,
        shortDescription,
        longDescription,
        aliases
      } = cmd.config;

      const desc =
        typeof longDescription === "string"
          ? longDescription
          : longDescription?.en || shortDescription?.en || shortDescription || "No description";

      const usage =
        typeof guide === "string"
          ? guide.replace(/{pn}/g, prefix)
          : guide?.en?.replace(/{pn}/g, prefix) || `${prefix}${name}`;

      return message.reply({
        body:
          `☠️ ${fancy("COMMAND INFO")} ☠️\n\n` +
          `➥ ${fancy("Name")}: ${fancy(name)}\n` +
          `➥ ${fancy("Category")}: ${fancy(category || "Uncategorized")}\n` +
          `➥ ${fancy("Description")}: ${fancy(desc)}\n` +
          `➥ ${fancy("Aliases")}: ${fancy(aliases?.length ? aliases.join(", ") : "None")}\n` +
          `➥ ${fancy("Usage")}: ${fancy(usage)}\n` +
          `➥ ${fancy("Author")}: ${fancy(author || "Unknown")}\n` +
          `➥ ${fancy("Version")}: ${fancy(version || "1.0")}`,
        attachment: fs.createReadStream(gifPath)
      });
    }

    // সব কমান্ড লিস্ট
    const formatCommands = (cmds) =>
      cmds.sort().map((cmd) => ` • ${fancy(cmd)}`).join("\n");

    let msg = `╔═━✧ ${fancy("GOATBOT MENU")} ✧━═╗\n`;
    const sortedCategories = Object.keys(categories).sort();

    for (const cat of sortedCategories) {
      const emoji = emojiMap[cat] || "📁";
      msg += `\n╔─ ${emoji} ${fancy(cat.toUpperCase())}\n`;
      msg += `${formatCommands(categories[cat])}\n╚─━━━━━\n`;
    }

    msg += `╔═━✧ ɪɴғᴏ ✧━═╗\n`;
    msg += `Total Commands : ${allCommands.size}\n`;
    msg += `Prefix         : ${prefix}\n`;
    msg += `Creator        : MOHAMMAD AKASH\n`;
    msg += `╚═━✧ END ✧━═╝`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(gifPath)
    });
  }
};

// GIF ডাউনলোড ফাংশন
function downloadGif(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to download '${url}' (${res.statusCode})`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}
