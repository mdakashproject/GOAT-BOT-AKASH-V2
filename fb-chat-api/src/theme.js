"use strict";

const utils = require('../utils.js');

module.exports = function (defaultFuncs, api, ctx) {
  /**
   * Made by rX Abdullah
   * Mqtt & Graph
   * Manages or sets the custom theme for a Facebook thread.
   * If only a theme name/keyword is provided, it attempts to find and set the matching theme.
   * If "list" is provided as the themeName, it lists available themes.
   *
   * @param {string} themeName The name or partial name of the theme (case-insensitive), or "list" to list themes.
   * @param {string} threadID The ID of the thread.
   * @param {Function} [callback] Optional callback function.
   * @param {string} [initiatorID] The ID of the user who initiated the theme change (e.g., from event.senderID).
   * @returns {Promise<void|Array<object>|object>} A promise that resolves on success (for setting theme, with a detailed event object), or with an array of themes (for listing), or rejects on error.
   */
  return async function theme(themeName, threadID, callback, initiatorID) {
    let _callback;
    let _initiatorID;

    let _resolveFunc;
    let _rejectFunc;
    const finalReturnPromise = new Promise((resolve, reject) => {
        _resolveFunc = resolve;
        _rejectFunc = reject;
    });

    if (utils.getType(callback) === "Function" || utils.getType(callback) === "AsyncFunction") {
        _callback = callback;
        _initiatorID = initiatorID;
    } else if (utils.getType(threadID) === "Function" || utils.getType(threadID) === "AsyncFunction") {
        _callback = threadID;
        threadID = null;
        _initiatorID = callback;
    } else if (utils.getType(callback) === "string") {
        _initiatorID = callback;
        _callback = undefined;
    } else {
        _callback = undefined;
        _initiatorID = undefined;
    }

    if (!_callback) {
      _callback = function (_err, _data) {
        if (_err) _rejectFunc(_err);
        else _resolveFunc(_data);
      };
    }

    _initiatorID = _initiatorID || ctx.userID;

    threadID = threadID || ctx.threadID;

    if (!threadID) {
      return _callback(new Error("threadID is required to manage themes."));
    }
    if (!themeName) {
      return _callback(new Error("themeName (or 'list') is required."));
    }

    if (!ctx.mqttClient) {
      return _callback(new Error("Not connected to MQTT"));
    }

    const fetchThemes = async () => {
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
        return resData.data.messenger_thread_themes.map(themeData => {
          if (!themeData || !themeData.id) return null;

          return {
            id: themeData.id,
            name: themeData.accessibility_label,
            description: themeData.description,
            appColorMode: themeData.app_color_mode,
            composerBackgroundColor: themeData.composer_background_color,
            backgroundGradientColors: themeData.background_gradient_colors,
            titleBarButtonTintColor: themeData.title_bar_button_tint_color,
            inboundMessageGradientColors: themeData.inbound_message_gradient_colors,
            titleBarTextColor: themeData.title_bar_text_color,
            composerTintColor: themeData.composer_tint_color,
            titleBarAttributionColor: themeData.title_bar_attribution_color,
            composerInputBackgroundColor: themeData.composer_input_background_color,
            hotLikeColor: themeData.hot_like_color,
            backgroundImage: themeData.background_asset?.image?.uri,
            messageTextColor: themeData.message_text_color,
            inboundMessageTextColor: themeData.inbound_message_text_color,
            primaryButtonBackgroundColor: themeData.primary_button_background_color,
            titleBarBackgroundColor: themeData.title_bar_background_color,
            tertiaryTextColor: themeData.tertiary_text_color,
            reactionPillBackgroundColor: themeData.reaction_pill_background_color,
            secondaryTextColor: themeData.secondary_text_color,
            fallbackColor: themeData.fallback_color,
            gradientColors: themeData.gradient_colors,
            normalThemeId: themeData.normal_theme_id,
            iconAsset: themeData.icon_asset?.image?.uri,
          };
        }).filter(Boolean);
      } catch (fetchErr) {
        throw new Error(`Failed to fetch theme list: ${fetchErr.message || fetchErr}`);
      }
    };

    const setThreadTheme = async (themeIDToSet, actualThemeName, initiatorID) => {
      let currentEpochId = parseInt(utils.generateOfflineThreadingID());

      const createAndPublish = (label, queueName, payload) => {
        currentEpochId = parseInt(utils.generateOfflineThreadingID());
        ctx.wsReqNumber += 1;
        ctx.wsTaskNumber += 1;

        const request_id = ctx.wsReqNumber;

        const queryPayload = {
          thread_key: threadID.toString(),
          theme_fbid: themeIDToSet.toString(),
          sync_group: 1,
          ...payload
        };

        const query = {
          failure_count: null,
          label: label,
          payload: JSON.stringify(queryPayload),
          queue_name: queueName,
          task_id: ctx.wsTaskNumber,
        };

        const context = {
          app_id: ctx.appID,
          payload: {
            epoch_id: currentEpochId,
            tasks: [query],
            version_id: '24631415369801570',
          },
          request_id: request_id,
          type: 3,
        };
        context.payload = JSON.stringify(context.payload);

        return new Promise((res, rej) => {
          ctx.mqttClient.publish('/ls_req', JSON.stringify(context), { qos: 1, retain: false }, err => {
            if (err) {
              return rej(new Error(`MQTT publish failed for request ${request_id}: ${err.message}`));
            }
            res();
          });
        });
      };
      
      try {
        await Promise.all([
          createAndPublish('1013', `ai_generated_theme`, {}),
          createAndPublish('1037', `msgr_custom_thread_theme`, {}),
          createAndPublish('1028', `thread_theme_writer`, {}),
          createAndPublish('43', `thread_theme`, { source: null, payload: null })
        ]);

        return {
            type: "thread_theme_update",
            threadID: threadID,
            themeID: themeIDToSet,
            themeName: actualThemeName,
            senderID: initiatorID,
            BotID: ctx.userID,
            timestamp: Date.now(),
        };

      } catch (publishErr) {
        throw new Error(`Failed to publish theme change MQTT messages: ${publishErr.message || publishErr}`);
      }
    };

    try {
      if (themeName.toLowerCase() === "list") {
        const themes = await fetchThemes();
        _callback(null, themes);
      } else {
        const themes = await fetchThemes();
        const normalizedThemeName = themeName.toLowerCase();

        let matchedTheme = null;

        if (!isNaN(normalizedThemeName)) {
            matchedTheme = themes.find(t => t.id === normalizedThemeName);
        }
        if (!matchedTheme) {
            matchedTheme = themes.find(t => t.name.toLowerCase() === normalizedThemeName);
        }
        
        if (!matchedTheme) {
          matchedTheme = themes.find(t => t.name.toLowerCase().includes(normalizedThemeName));
        }

        if (!matchedTheme) {
          throw new Error(`Theme "${themeName}" not found. Try '/theme list' for available themes.`);
        }

        const themeEventObject = await setThreadTheme(matchedTheme.id, matchedTheme.name, _initiatorID);
        
        _callback(null, themeEventObject);
      }
    } catch (err) {
      const finalError = err instanceof Error ? err : new Error(err.message || err.error || 'An unknown error occurred during theme operation.');
      _callback(finalError);
    }

    return finalReturnPromise;
  };
};
