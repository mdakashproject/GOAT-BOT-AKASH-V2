exports.config = {
    name: "greetings",
    version: "5.0",
    author: "MOHAMMAD AKASH",
    countDown: 0,
    role: 0,
    shortDescription: "Just sends 'Walaikumus Salam' + fork link",
    longDescription: "If someone sends Salam, replies 'Walaikumus Salam'. If someone sends fork/github, replies repo link. 1 reply every 10 seconds.",
    category: "system",
    guide: { en: "Type Salam or fork" }
};

const lastSent = {};
const cooldown = 10000; // 10 seconds

exports.onStart = async function() {};

exports.onChat = async function({ event, api }) {
    const threadID = event.threadID;
    const now = Date.now();

    // Cooldown check
    if (lastSent[threadID] && now - lastSent[threadID] < cooldown) return;

    const message = (event.body || "").toLowerCase().trim();
    if (!message) return;

    // Check for Salam messages
    const isSalam = message.includes("সালাম") || 
                    message.includes("আসসালাম") || 
                    message.includes("assalam") || 
                    message.includes("salam") || 
                    message.includes("w salam") || 
                    message.includes("alaikum");

    // Check for fork/github requests
    const isFork = message.includes("fork") || 
                   message.includes("github") || 
                   message.includes("repository") || 
                   message.includes("ফর্ক");

    let sent = false;

    if (isSalam) {
        api.sendMessage("ওলাইকুমুস সালাম", threadID, event.messageID);
        sent = true;
    } else if (isFork) {
        api.sendMessage("🔗 My GitHub Repo:\nhttps://github.com/akashbotdev/GOAT-BOT-AKASH-V2.git", threadID, event.messageID);
        sent = true;
    }

    if (sent) lastSent[threadID] = now;
};
