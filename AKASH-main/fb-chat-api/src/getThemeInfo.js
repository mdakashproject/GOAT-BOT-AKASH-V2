"use strict";

const utils = require('../utils');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getThemeInfo(threadID, callback) {
    if (!threadID) {
      const error = new Error("threadID is required");
      if (callback) return callback(error);
      throw error;
    }

    let resolveFunc, rejectFunc;
    const promise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    try {
      let threadInfo;
      try {
        threadInfo = await api.getThreadInfo(threadID);
      } catch (getInfoErr) {
        // If getThreadInfo fails, thread might not exist or access is restricted
        // Return a basic theme info object with defaults
        const themeInfo = {
          threadID: threadID,
          threadName: '',
          color: null,
          emoji: '👍',
          theme_id: null,
          theme_color: null,
          gradient_colors: null,
          is_default: true,
          error: getInfoErr.message || 'Could not retrieve full thread info'
        };

        if (callback) {
          return callback(null, themeInfo);
        } else {
          return resolveFunc(themeInfo);
        }
      }

      if (!threadInfo || threadInfo.length === 0) {
        // Thread exists but no info returned - return defaults
        const themeInfo = {
          threadID: threadID,
          threadName: '',
          color: null,
          emoji: '👍',
          theme_id: null,
          theme_color: null,
          gradient_colors: null,
          is_default: true
        };

        if (callback) {
          return callback(null, themeInfo);
        } else {
          return resolveFunc(themeInfo);
        }
      }

      const info = Array.isArray(threadInfo) ? threadInfo[0] : threadInfo;

      const themeInfo = {
        threadID: threadID,
        threadName: info.threadName || info.name || '',
        color: info.color || null,
        emoji: info.emoji || '👍',
        theme_id: info.theme_id || info.themeID || null,
        theme_color: info.theme_color || info.color || null,
        gradient_colors: info.gradient_colors || null,
        is_default: !info.color && !info.theme_id
      };

      if (callback) {
        callback(null, themeInfo);
      } else {
        resolveFunc(themeInfo);
      }
    } catch (err) {
      // Preserve the original error message from getThreadInfo
      // Don't override with generic "Could not retrieve thread info"
      utils.error("getThemeInfo", err);
      if (callback) {
        callback(err);
      } else {
        rejectFunc(err);
      }
    }

    return promise;
  };
};
