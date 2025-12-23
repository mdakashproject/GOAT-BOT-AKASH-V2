const fs = require("fs");

module.exports = {
  config: {
    name: "pending",
    version: "1.0.5",
    author: "Rx Abdullah Modified by MOHAMMAD AKASH ",
    aliases: [],
    role: 2,
    shortDescription: "Manage bot's waiting messages",
    longDescription: "Approve or cancel pending groups",
    category: "system",
    countDown: 10
  },

  languages: {
    "en": {
      "invaildNumber": "%1 𝙸𝚂 𝙽𝙾𝚃 𝙰 𝚅𝙰𝙻𝙸𝙳 𝙽𝚄𝙼𝙱𝙴𝚁",
      "cancelSuccess": "❌ 𝚁𝙴𝙵𝚄𝚂𝙴𝙳 %1 𝚃𝙷𝚁𝙴𝙰𝙳𝚂!",
      "notiBox": "✨🎉 𝙲𝙾𝙽𝙶𝚁𝙰𝚃𝚂! 𝚈𝙾𝚄𝚁 𝙶𝚁𝙾𝚄𝙿 𝙷𝙰𝚂 𝙱𝙴𝙴𝙽 𝙰𝙿𝙿𝚁𝙾𝚅𝙴𝙳! 🎉✨\n🚀 𝚄𝚂𝙴 !𝙷𝙴𝙻𝙿 𝚃𝙾 𝙴𝚇𝙿𝙻𝙾𝚁𝙴 𝙰𝙻𝙻 𝙰𝚅𝙰𝙸𝙻𝙰𝙱𝙻𝙴 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂",
      "approveSuccess": "✅ 𝙰𝙿𝙿𝚁𝙾𝚅𝙴𝙳 %1 𝚃𝙷𝚁𝙴𝙰𝙳𝚂!",
      "cantGetPendingList": "⚠️ 𝙲𝙰𝙽'𝚃 𝙶𝙴𝚃 𝚃𝙷𝙴 𝙿𝙴𝙽𝙳𝙸𝙽𝙶 𝙻𝙸𝚂𝚃!",
      "returnListPending": "»「𝙿𝙴𝙽𝙳𝙸𝙽𝙶」«❮ 𝚃𝙾𝚃𝙰𝙻 𝚃𝙷𝚁𝙴𝙰𝙳𝚂 𝚃𝙾 𝙰𝙿𝙿𝚁𝙾𝚅𝙴: %1 ❯\n\n%2",
      "returnListClean": "「𝙿𝙴𝙽𝙳𝙸𝙽𝙶」𝚃𝙷𝙴𝚁𝙴 𝙸𝚂 𝙽𝙾 𝚃𝙷𝚁𝙴𝙰𝙳 𝙸𝙽 𝚃𝙷𝙴 𝙻𝙸𝚂𝚃"
    }
  },

  _getText: function(key, ...args) {
    const text = this.languages["en"][key] || key;
    return args.length ? text.replace("%1", args[0]).replace("%2", args[1] || "") : text;
  },

  onStart: async function({ api, event }) {
    const { threadID, messageID, senderID } = event;
    let pendingList = [];

    try {
      const otherThreads = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pendingThreads = await api.getThreadList(100, null, ["PENDING"]) || [];
      pendingList = [...otherThreads, ...pendingThreads].filter(group => group.isSubscribed && group.isGroup);
    } catch {
      return api.sendMessage(this._getText("cantGetPendingList"), threadID, messageID);
    }

    if (pendingList.length === 0) {
      return api.sendMessage(this._getText("returnListClean"), threadID, messageID);
    }

    let msg = "";
    pendingList.forEach((group, index) => {
      msg += `${index + 1}/ ${group.name} (${group.threadID})\n`;
    });

    return api.sendMessage(this._getText("returnListPending", pendingList.length, msg), threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        pending: pendingList,
        unsendTimeout: setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, this.config.countDown * 1000)
      });
    }, messageID);
  },

  onReply: async function({ event, Reply, api }) {
    const { author, pending, unsendTimeout } = Reply;
    if (String(event.senderID) !== String(author)) return;
    clearTimeout(unsendTimeout);

    const { body, threadID } = event;
    const input = body.trim().toLowerCase().split(/\s+/);
    let count = 0;

    const getText = this._getText.bind(this);

    if (input[0] === "c" || input[0] === "cancel") {
      for (let i = 1; i < input.length; i++) {
        const idx = parseInt(input[i]);
        if (isNaN(idx) || idx <= 0 || idx > pending.length) return api.sendMessage(getText("invaildNumber", input[i]), threadID);
        await api.removeUserFromGroup(api.getCurrentUserID(), pending[idx - 1].threadID);
        count++;
      }
      return api.sendMessage(getText("cancelSuccess", count), threadID);
    } else {
      for (let i = 0; i < input.length; i++) {
        const idx = parseInt(input[i]);
        if (isNaN(idx) || idx <= 0 || idx > pending.length) return api.sendMessage(getText("invaildNumber", input[i]), threadID);
        await api.sendMessage(getText("notiBox"), pending[idx - 1].threadID);
        count++;
      }
      return api.sendMessage(getText("approveSuccess", count), threadID);
    }
  }
};
