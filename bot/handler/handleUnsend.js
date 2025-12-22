module.exports = function({ api, Users }) {
  return function({ event, Users, args }) {
        const { senderID, reaction, messageID, threadID, userID } = event;
        if (senderID == api.getCurrentUserID()) {
            if (reaction == "😡") return api.unsendMessage(messageID);
        }
    }

}
