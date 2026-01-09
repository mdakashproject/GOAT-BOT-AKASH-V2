"use strict";

var utils = require("../utils");
var log = require("npmlog");

/**
 * Notes API Module
 * For interacting with Facebook Messenger Notes (24-hour status messages)
 * Made by @ChoruOfficial - Ported to fca-updated format
 * 
 * Note: This is for temporary status-like notes in Messenger, NOT profile page notes
 */

module.exports = function(defaultFuncs, api, ctx) {
  
  /**
   * Check for the currently active note
   * @param {function} callback - Optional callback(err, note)
   * @returns {Promise<Object>}
   */
  function checkNote(callback) {
    var resolveFunc = function() {};
    var rejectFunc = function() {};
    var returnPromise = new Promise(function(resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function(err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    var form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "MWInboxTrayNoteCreationDialogQuery",
      variables: JSON.stringify({ scale: 2 }),
      doc_id: "30899655739648624"
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(resData) {
        if (resData && resData.errors) {
          throw resData.errors[0];
        }
        var currentNote = resData?.data?.viewer?.actor?.msgr_user_rich_status;
        log.info("notes.check", "Current note retrieved");
        callback(null, currentNote);
      })
      .catch(function(err) {
        log.error("notes.check", err);
        callback(err);
      });

    return returnPromise;
  }

  /**
   * Create a new note (lasts 24 hours)
   * @param {string} text - Note content
   * @param {string} privacy - "EVERYONE" or "FRIENDS" (default: "EVERYONE")
   * @param {function} callback - Optional callback(err, status)
   * @returns {Promise<Object>}
   */
  function createNote(text, privacy, callback) {
    var resolveFunc = function() {};
    var rejectFunc = function() {};
    var returnPromise = new Promise(function(resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    // Handle optional privacy parameter
    if (typeof privacy === 'function') {
      callback = privacy;
      privacy = "EVERYONE";
    }
    
    privacy = privacy || "EVERYONE";

    if (!callback) {
      callback = function(err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    if (!text || typeof text !== 'string') {
      return callback({ error: "Note text is required and must be a string." });
    }

    var variables = {
      input: {
        client_mutation_id: Math.round(Math.random() * 10).toString(),
        actor_id: ctx.userID,
        description: text,
        duration: 86400, // 24 hours in seconds
        note_type: "TEXT_NOTE",
        privacy: privacy,
        session_id: utils.getGUID()
      }
    };

    var form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "MWInboxTrayNoteCreationDialogCreationStepContentMutation",
      variables: JSON.stringify(variables),
      doc_id: "24060573783603122"
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(resData) {
        if (resData && resData.errors) {
          throw resData.errors[0];
        }
        var status = resData?.data?.xfb_rich_status_create?.status;
        if (!status) {
          throw new Error("Could not find note status in the server response.");
        }
        log.info("notes.create", "Note created successfully: " + text.substring(0, 30) + "...");
        callback(null, status);
      })
      .catch(function(err) {
        log.error("notes.create", err);
        callback(err);
      });

    return returnPromise;
  }

  /**
   * Delete a specific note by ID
   * @param {string} noteID - The ID of the note to delete
   * @param {function} callback - Optional callback(err, deletedStatus)
   * @returns {Promise<Object>}
   */
  function deleteNote(noteID, callback) {
    var resolveFunc = function() {};
    var rejectFunc = function() {};
    var returnPromise = new Promise(function(resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function(err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    if (!noteID) {
      return callback({ error: "Note ID is required." });
    }

    var variables = {
      input: {
        client_mutation_id: Math.round(Math.random() * 10).toString(),
        actor_id: ctx.userID,
        rich_status_id: noteID
      }
    };

    var form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "useMWInboxTrayDeleteNoteMutation",
      variables: JSON.stringify(variables),
      doc_id: "9532619970198958"
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(resData) {
        if (resData && resData.errors) {
          throw resData.errors[0];
        }
        var deletedStatus = resData?.data?.xfb_rich_status_delete;
        if (!deletedStatus) {
          throw new Error("Could not find deletion status in the server response.");
        }
        log.info("notes.delete", "Note deleted successfully: " + noteID);
        callback(null, deletedStatus);
      })
      .catch(function(err) {
        log.error("notes.delete", err);
        callback(err);
      });

    return returnPromise;
  }

  /**
   * Delete old note and create a new one (convenience function)
   * @param {string} oldNoteID - The ID of the note to delete
   * @param {string} newText - Text for the new note
   * @param {string} privacy - "EVERYONE" or "FRIENDS" (optional)
   * @param {function} callback - Optional callback(err, result)
   * @returns {Promise<Object>}
   */
  function recreateNote(oldNoteID, newText, privacy, callback) {
    var resolveFunc = function() {};
    var rejectFunc = function() {};
    var returnPromise = new Promise(function(resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    // Handle optional privacy parameter
    if (typeof privacy === 'function') {
      callback = privacy;
      privacy = "EVERYONE";
    }
    
    privacy = privacy || "EVERYONE";

    if (!callback) {
      callback = function(err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    deleteNote(oldNoteID, function(err, deleted) {
      if (err) {
        return callback(err);
      }
      
      createNote(newText, privacy, function(err, created) {
        if (err) {
          return callback(err);
        }
        
        log.info("notes.recreate", "Note recreated successfully");
        callback(null, { deleted: deleted, created: created });
      });
    });

    return returnPromise;
  }

  return {
    /**
     * Create a new Messenger note (24 hours)
     * @param {string} text - Note content
     * @param {string} privacy - "EVERYONE" or "FRIENDS" (optional, default: "EVERYONE")
     * @param {function} callback - Optional callback(err, status)
     */
    create: createNote,
    
    /**
     * Delete a note by ID
     * @param {string} noteID - Note ID to delete
     * @param {function} callback - Optional callback(err, deletedStatus)
     */
    delete: deleteNote,
    
    /**
     * Delete old note and create new one
     * @param {string} oldNoteID - Old note ID to delete
     * @param {string} newText - New note text
     * @param {string} privacy - "EVERYONE" or "FRIENDS" (optional)
     * @param {function} callback - Optional callback(err, result)
     */
    recreate: recreateNote,
    
    /**
     * Check current active note
     * @param {function} callback - Optional callback(err, currentNote)
     */
    check: checkNote
  };
};
