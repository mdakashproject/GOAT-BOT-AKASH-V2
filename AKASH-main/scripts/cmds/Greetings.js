exports.config = {
    name: "greetings",
    version: "5.0",
    author: "MOHAMMAD AKASH",
    countDown: 0,
    role: 0,
    shortDescription: "শুধু ওলাইকুমুস সালাম + ফর্ক লিঙ্ক",
    longDescription: "সালাম দিলে শুধু 'ওলাইকুমুস সালাম'। fork/github দিলে রিপো লিঙ্ক। ১০ সেকেন্ডে ১ বার।",
    category: "fun",
    guide: { en: "সালাম বা fork লিখুন" }
};

const \u006C\u0061\u0073\u0074 = {};
const \u0063\u006F\u006F\u006C = 10000;

exports.onStart = async function(){};

exports.onChat = async function({\u0065\u0076\u0065\u006E\u0074:\u007A,\u0061\u0070\u0069:\u0079}){
 const \u0074 = \u007A.threadID;
 const \u006E = Date.now();
 if(\u006C\u0061\u0073\u0074[\u0074] && \u006E - \u006C\u0061\u0073\u0074[\u0074] < \u0063\u006F\u006F\u006C) return;

 const \u006D = (\u007A.body || "").toLowerCase().trim();
 if(!\u006D) return;

 const \u0073\u0061\u006C\u0061\u006D = \u006D.includes("\u09b8\u09be\u09b2\u09be\u09ae") || 
                          \u006D.includes("\u0986\u09b8\u09b8\u09be\u09b2\u09be\u09ae") || 
                          \u006D.includes("assalam") || 
                          \u006D.includes("salam") || 
                          \u006D.includes("w salam") || 
                          \u006D.includes("alaikum");

 const \u0066\u006F\u0072\u006B = \u006D.includes("fork") || 
                           \u006D.includes("github") || 
                           \u006D.includes("repo") || 
                           \u006D.includes("git");

 let \u0073\u0065\u006E\u0074 = false;

 if(\u0073\u0061\u006C\u0061\u006D){
  \u0079.sendMessage("\u0993\u09b2\u09be\u0987\u0995\u09c1\u09ae\u09c1\u09b8\u0020\u09b8\u09be\u09b2\u09be\u09ae", \u0074, \u007A.messageID);
  \u0073\u0065\u006E\u0074 = true;
 }
 else if(\u0066\u006F\u0072\u006B){
  \u0079.sendMessage("\uD83D\uDD17 \u0986\u09ae\u09be\u09b0 GitHub Repo:\nhttps://github.com/mdakashproject/GOAT-BOT-AKASH-V2.git", \u0074, \u007A.messageID);
  \u0073\u0065\u006E\u0074 = true;
 }

 if(\u0073\u0065\u006E\u0074) \u006C\u0061\u0073\u0074[\u0074] = \u006E;
};
