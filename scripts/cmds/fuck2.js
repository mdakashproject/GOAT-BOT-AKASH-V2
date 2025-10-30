const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "fuck2",
    aliases: ["fck2"],
    version: "3.2",
    author: "MOHAMMAD AKASH",
    countDown: 5,
    role: 0,
    description: "Overlay two users’ avatars on another NSFW image template (fun only)",
    category: "fun",
  },

  onStart: async function ({ message, event }) {
    try {
      const mention = Object.keys(event.mentions);
      if (mention.length === 0)
        return message.reply("⚠️ Please mention 1 person to use this command!");

      const one = event.senderID;
      const two = mention[0];

      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const bgPath = path.join(dir, "fuckv3_template.png");

      // Download background if not exists
      if (!fs.existsSync(bgPath)) {
        const img = await axios.get(
          "https://i.ibb.co/TW9Kbwr/images-2022-08-14-T183542-356.jpg",
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(bgPath, Buffer.from(img.data));
      }

      const avatar1 = path.join(dir, `${one}.png`);
      const avatar2 = path.join(dir, `${two}.png`);

      const getAvatar = async (id, savePath) => {
        const avatar = await axios.get(
          `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(savePath, Buffer.from(avatar.data));
      };

      await getAvatar(one, avatar1);
      await getAvatar(two, avatar2);

      // Load images
      const bg = await loadImage(bgPath);
      const av1 = await loadImage(avatar1);
      const av2 = await loadImage(avatar2);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, bg.width, bg.height);

      // Draw circular avatars
      // Avatar 1 (bottom left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(70, 350, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av1, 20, 300, 100, 100);
      ctx.restore();

      // Avatar 2 (top right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(175, 95, 75, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av2, 100, 20, 150, 150);
      ctx.restore();

      const outPath = path.join(dir, `fuck2_result_${one}_${two}.png`);
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outPath, buffer);

      await message.reply({
        body: "💥 Done!",
        attachment: fs.createReadStream(outPath),
      });

      // Cleanup
      fs.unlinkSync(avatar1);
      fs.unlinkSync(avatar2);
      fs.unlinkSync(outPath);
    } catch (err) {
      console.error(err);
      return message.reply(`❌ Error while generating image: ${err.message}`);
    }
  },
};
