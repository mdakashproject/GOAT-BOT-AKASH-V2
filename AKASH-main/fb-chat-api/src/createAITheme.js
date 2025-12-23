/**
 * @by Allou Mohamed
 * do not remove the author name to get more updates
 */

"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function createAITheme(prompt, numThemes, callback) {
    if (typeof numThemes === 'function') {
      callback = numThemes;
      numThemes = 3;
    }
    if (typeof numThemes !== 'number' || numThemes < 1) {
      numThemes = 3;
    }
    if (numThemes > 10) {
      numThemes = 10;
    }

    const form = {
      av: ctx.i_userID || ctx.userID,
      qpl_active_flow_ids: "25308101,25309433,521482085",
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "useGenerateAIThemeMutation",
      variables: JSON.stringify({
        input: {
          client_mutation_id: "1",
          actor_id: ctx.i_userID || ctx.userID,
          bypass_cache: true,
          caller: "MESSENGER",
          num_themes: numThemes,
          prompt: prompt
        }
      }),
      server_timestamps: true,
      doc_id: "23873748445608673",
      fb_api_analytics_tags: JSON.stringify([
        "qpl_active_flow_ids=25308101,25309433,521482085"
      ]),
      fb_dtsg: ctx.fb_dtsg
    };

    const extractUrl = (obj) => {
      if (!obj) return null;
      if (typeof obj === 'string') return obj;
      return obj.uri || obj.url || null;
    };

    const normalizeTheme = (theme) => {
      const normalized = { ...theme };

      let lightUrl = null;
      let darkUrl = null;

      const previewUrls = theme.preview_image_urls || theme.preview_images || theme.preview_urls;

      if (previewUrls) {
        if (typeof previewUrls === 'string') {
          lightUrl = darkUrl = previewUrls;
        } else if (Array.isArray(previewUrls)) {
          lightUrl = extractUrl(previewUrls[0]) || null;
          darkUrl = extractUrl(previewUrls[1]) || lightUrl;
        } else if (typeof previewUrls === 'object') {
          lightUrl = extractUrl(previewUrls.light_mode) || extractUrl(previewUrls.light) || null;
          darkUrl = extractUrl(previewUrls.dark_mode) || extractUrl(previewUrls.dark) || null;
        }
      }

      if (!lightUrl && theme.background_asset && theme.background_asset.image) {
        lightUrl = extractUrl(theme.background_asset.image);
      }
      if (!lightUrl && theme.icon_asset && theme.icon_asset.image) {
        lightUrl = extractUrl(theme.icon_asset.image);
      }

      if (!darkUrl && theme.alternative_themes && theme.alternative_themes.length > 0) {
        const darkTheme = theme.alternative_themes[0];
        if (darkTheme.background_asset && darkTheme.background_asset.image) {
          darkUrl = extractUrl(darkTheme.background_asset.image);
        }
        if (!darkUrl && darkTheme.icon_asset && darkTheme.icon_asset.image) {
          darkUrl = extractUrl(darkTheme.icon_asset.image);
        }
      }

      if (lightUrl && !darkUrl) {
        darkUrl = lightUrl;
      } else if (darkUrl && !lightUrl) {
        lightUrl = darkUrl;
      }

      if (lightUrl || darkUrl) {
        normalized.preview_image_urls = {
          light_mode: lightUrl,
          dark_mode: darkUrl
        };
      }

      return normalized;
    };

    const promise = defaultFuncs
      .post("https://web.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.errors) {
          throw resData.errors;
        }
        const themes = resData.data.xfb_generate_ai_themes_from_prompt.themes;
        return themes.map(normalizeTheme);
      });

    if (callback) {
      promise.then(data => callback(null, data)).catch(err => {
        utils.error("createAITheme", err.message || err);
        callback(err);
      });
      return;
    }

    return promise.catch(err => {
      utils.error("createAITheme", err.message || err);
      throw err;
    });
  };
};
