"use strict";

const utils = require('../utils');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getTheme(threadID, callback) {
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

    const form = {
      fb_api_caller_class: 'RelayModern',
      fb_api_req_friendly_name: 'MWPThreadThemeQuery_AllThemesQuery',
      variables: JSON.stringify({ version: "default" }),
      server_timestamps: true,
      doc_id: '24474714052117636',
    };

    try {
      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form, null, {
          "x-fb-friendly-name": "MWPThreadThemeQuery_AllThemesQuery",
          "x-fb-lsd": ctx.lsd,
          "referer": `https://www.facebook.com/messages/t/${threadID}`
        })
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      if (!resData.data || !resData.data.messenger_thread_themes) {
        throw new Error("Could not retrieve thread themes from response.");
      }

      const extractUrl = (obj) => {
        if (!obj) return null;
        if (typeof obj === 'string') return obj;
        return obj.uri || obj.url || null;
      };

      const baseThemes = resData.data.messenger_thread_themes.map(themeData => {
        if (!themeData || !themeData.id) return null;

        return {
          id: themeData.id,
          name: themeData.name || '',
          theme_idx: themeData.theme_idx,
          accessibility_label: themeData.accessibility_label || themeData.name || ''
        };
      }).filter(t => t !== null);

      const themesWithPreviews = await Promise.all(
        baseThemes.map(async (baseTheme) => {
          try {
            const detailedTheme = await api.fetchThemeData(baseTheme.id);

            const theme = {
              ...baseTheme,
              gradient_colors: detailedTheme.colors || [],
              primary_color: detailedTheme.colors?.[0] || null
            };

            if (detailedTheme.backgroundImage) {
              theme.background_image = detailedTheme.backgroundImage;
              theme.preview_image_urls = {
                light_mode: detailedTheme.backgroundImage,
                dark_mode: detailedTheme.backgroundImage
              };
            }

            return theme;
          } catch (fetchErr) {
            utils.error("getTheme - fetchThemeData", `Failed to fetch details for theme ${baseTheme.id}: ${fetchErr.message}`);
            return baseTheme;
          }
        })
      );

      if (callback) {
        callback(null, themesWithPreviews);
      } else {
        resolveFunc(themesWithPreviews);
      }
    } catch (err) {
      utils.error("getTheme", err);
      if (callback) {
        callback(err);
      } else {
        rejectFunc(err);
      }
    }

    return promise;
  };
};
