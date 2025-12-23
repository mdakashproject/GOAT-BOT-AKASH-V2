const moment = require("moment-timezone");

let running = false;

module.exports = {
  config: {
    name: "fdaccept",
    aliases: ["fdacp", "fdrequest "],
    version: "2.1",
    author: "MOHAMMAD AKASH",
    countDown: 8,
    role: 2,
    shortDescription: "Accept all friend requests automatically",
    longDescription: "Automatically accepts all pending friend requests with /frequ all and can stop with /frequ stop",
    category: "Utility",
  },

  onStart: async function ({ event, api }) {
    const args = event.body.trim().toLowerCase().split(" ");
    const action = args[1];

    if (!action) {
      return api.sendMessage("Usage:\n/frequ all - accept all pending requests\n/frequ stop - stop process", event.threadID);
    }

    if (action === "stop") {
      running = false;
      return api.sendMessage("⛔ Friend request auto-accept stopped.", event.threadID);
    }

    if (action !== "all") {
      return api.sendMessage("Usage:\n/frequ all - accept all pending requests\n/frequ stop - stop process", event.threadID);
    }

    running = true;
    api.sendMessage("⚡ Starting to accept all pending friend requests...", event.threadID);

    const success = [];
    const failed = [];

    while (running) {
      try {
        const form = {
          av: api.getCurrentUserID(),
          fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
          fb_api_caller_class: "RelayModern",
          doc_id: "4499164963466303",
          variables: JSON.stringify({ input: { scale: 3 } })
        };

        const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        const listRequest = JSON.parse(response)?.data?.viewer?.friending_possibilities?.edges || [];

        if (listRequest.length === 0) {
          running = false;
          // সব শেষে summary message পাঠানো
          let finalMsg = "";
          if (success.length) finalMsg += `✅ Completed!\nAccepted ${success.length} user(s):\n${success.join("\n")}`;
          if (failed.length) finalMsg += `\n❌ Failed ${failed.length} user(s):\n${failed.join("\n")}`;
          if (!finalMsg) finalMsg = "No friend requests were processed.";
          return api.sendMessage(finalMsg, event.threadID);
        }

        for (const user of listRequest) {
          if (!running) break;

          const acceptForm = {
            av: api.getCurrentUserID(),
            fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
            fb_api_caller_class: "RelayModern",
            doc_id: "3147613905362928",
            variables: {
              input: {
                source: "friends_tab",
                actor_id: api.getCurrentUserID(),
                friend_requester_id: user.node.id,
                client_mutation_id: Math.random().toString(36).substring(2, 15)
              },
              scale: 3,
              refresh_num: 0
            }
          };

          try {
            await api.httpPost("https://www.facebook.com/api/graphql/", {
              ...acceptForm,
              variables: JSON.stringify(acceptForm.variables)
            });
            console.log(`Accepted: ${user.node.name}`);
            success.push(user.node.name);
          } catch (e) {
            console.log(`Failed: ${user.node.name}`);
            failed.push(user.node.name);
          }
        }

      } catch (error) {
        console.error("Error fetching friend requests:", error);
        running = false;
        return api.sendMessage("❌ Error occurred while processing friend requests.", event.threadID);
      }
    }
  }
};
