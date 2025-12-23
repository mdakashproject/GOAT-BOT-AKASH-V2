"use strict";

const utils = require('../utils');

module.exports = (defaultFuncs, api, ctx) => {
  return async function forwardMessage(messageID, threadIDs, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = (err, result) => {
        if (err) return rejectFunc(err);
        resolveFunc(result);
      };
    }

    try {
      if (!Array.isArray(threadIDs)) {
        threadIDs = [threadIDs];
      }

      const form = {
        message_id: messageID
      };
      
      threadIDs.forEach(id => {
        form[`recipient_ids[${id}]`] = id;
      });

      const res = await defaultFuncs.post(
        "https://www.facebook.com/ajax/mercury/forward_message.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (res && res.error) {
        throw res;
      }

      callback(null, { success: true, forwardedTo: threadIDs });
    } catch (err) {
      utils.error("forwardMessage", err);
      callback(err);
    }

    return returnPromise;
  };
};
