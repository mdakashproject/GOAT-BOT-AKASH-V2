/**
 * Updated setPostReaction — Working 2025
 * Fixed by rX Abdullah
 */

"use strict";

const utils = require("../utils");

function formatData(resData) {
  return {
    viewer_feedback_reaction_info:
      resData.feedback_react?.feedback?.viewer_feedback_reaction_info || null,
    top_reactions: resData.feedback_react?.feedback?.top_reactions?.edges || [],
    reaction_count: resData.feedback_react?.feedback?.reaction_count || 0,
  };
}

module.exports = function (defaultFuncs, api, ctx) {
  return function setPostReaction(postID, type, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};

    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      if (utils.getType(type) === "Function") {
        callback = type;
        type = 0;
      } else {
        callback = function (err, data) {
          if (err) return rejectFunc(err);
          resolveFunc(data);
        };
      }
    }

    const map = {
      unlike: 0,
      like: 1,
      heart: 2,
      love: 16,
      haha: 4,
      wow: 3,
      sad: 7,
      angry: 8,
    };

    if (utils.getType(type) === "String") {
      type = map[type.toLowerCase()];
    }

    if (!type && type !== 0) {
      return callback({ error: "Invalid reaction type" });
    }

    // NEW updated GraphQL doc_id (2025 working)
    const form = {
      av: ctx.userID,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "CometUFIFeedbackReactMutation",
      doc_id: "7711610265539688", // 🔥 NEW WORKING ONE
      variables: JSON.stringify({
        input: {
          actor_id: ctx.userID,
          feedback_id: Buffer.from("feedback:" + postID).toString("base64"),
          feedback_reaction: type,
          feedback_source: "OBJECT",
          client_mutation_id: (Date.now()).toString(),
        },
        scale: 3,
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.errors) throw resData.errors;
        return callback(null, formatData(resData.data));
      })
      .catch((err) => {
        console.error("setPostReaction ERROR:", err);
        return callback(err);
      });

    return returnPromise;
  };
};
