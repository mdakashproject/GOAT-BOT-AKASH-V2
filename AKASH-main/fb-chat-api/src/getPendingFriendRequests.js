"use strict";

var log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  return function getPendingFriendRequests(callback) {
    var resolveFunc = function () { };
    var rejectFunc = function () { };
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    const url = 'https://www.facebook.com/reqs.php';

    defaultFuncs
      .get(url, ctx.jar, null)
      .then(function(resData) {
        log.info("getPendingFriendRequests", "Fetched pending requests");

        // Parse the HTML to extract user information
        // This is a placeholder: implement parsing logic based on actual response
        const pendingRequests = [
          // Example data structure
          { userID: '123456789', name: 'John Doe' },
          { userID: '987654321', name: 'Jane Smith' }
        ];

        return callback(null, pendingRequests);
      })
      .catch(function (err) {
        log.error("getPendingFriendRequests", err);
        return callback(err);
      });

    return returnPromise;
  };
};
