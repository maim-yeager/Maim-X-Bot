const axios = require('axios');

// ============================================================
//  autochat.js — Auto AI Chat (ChatGPT API)
//  Credits : XTﾠMꫝɪᴍﾠ!!
//  Owner   : maim boos
// ============================================================

module.exports.config = {
  name: "autochat",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "XTﾠMꫝɪᴍﾠ!!",
  description: "ChatGPT দিয়ে সব মেসেজের AI রিপ্লাই দেয়",
  commandCategory: "AI",
  usages: "[on/off]",
  cooldowns: 3,
  envConfig: {
    OPENAI_API_KEY: "",   // তোমার ChatGPT API key এখানে দাও অথবা config.json এ রাখো
    model: "gpt-3.5-turbo"
  }
};

// ─── Toggle ON/OFF command ───────────────────────────────────
module.exports.run = async ({ api, event, args, Threads, getText }) => {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data || {};

  if (args[0] && args[0].toLowerCase() === "off") {
    data["autochat"] = false;
    await Threads.setData(threadID, { data });
    global.data.threadData.set(threadID, data);
    return api.sendMessage(
      `╭──────•◈•──────╮\n│  🤖 Xona mia !! 😺\n│  Auto Chat: ❌ OFF\n│  Owner: maim boos\n╰──────•◈•──────╯`,
      threadID, messageID
    );
  } else {
    data["autochat"] = true;
    await Threads.setData(threadID, { data });
    global.data.threadData.set(threadID, data);
    return api.sendMessage(
      `╭──────•◈•──────╮\n│  🤖 Xona mia !! 😺\n│  Auto Chat: ✅ ON\n│  এখন যেকোনো মেসেজে AI রিপ্লাই দেবো!\n│  Owner: maim boos\n╰──────•◈•──────╯`,
      threadID, messageID
    );
  }
};

// ─── Handle every incoming message ──────────────────────────
module.exports.handleEvent = async ({ api, event, Users }) => {
  const { threadID, messageID, senderID, body, type } = event;

  // শুধু message type handle করো
  if (type !== "message" && type !== "message_reply") return;

  // Bot নিজের message ignore
  try {
    const botID = api.getCurrentUserID();
    if (senderID === botID) return;
  } catch(e) {}

  // autochat চালু আছে কিনা দেখো
  const thread = global.data.threadData.get(parseInt(threadID)) || {};
  if (!thread["autochat"]) return;

  // খালি message ignore
  if (!body || body.trim() === "") return;

  // Command prefix দিয়ে শুরু হলে ignore (bot command)
  const prefix = global.config.PREFIX || "/";
  if (body.startsWith(prefix)) return;

  // API key নাও
  const apiKey = (global.config.autochat && global.config.autochat.OPENAI_API_KEY)
    || process.env.OPENAI_API_KEY
    || "";

  // Sender name নাও
  let senderName = "বন্ধু";
  try {
    senderName = await Users.getNameUser(senderID);
  } catch(e) {}

  try {
    let replyText = "";

    if (apiKey && apiKey.length > 10) {
      // ─── Real ChatGPT API ─────────────────────────────────
      const systemPrompt = `তুমি "Xona mia" নামের একটি মজাদার ও বুদ্ধিমান Facebook Messenger বট।
তোমার মালিক হলো "maim boos"।
তুমি বাংলা ও ইংরেজি মিশিয়ে funny, witty, এবং প্রাণবন্ত ভাষায় কথা বলো।
কখনো বাংলিশ (Banglish) ব্যবহার করো — যেমন "bhai ki bolcho?", "aree vai!", "kemon achen?", "LOL", "XD"।
রিপ্লাই ছোট রাখো (২-৪ লাইন), কিন্তু হাস্যরসাত্মক এবং আন্তরিক হও।
প্রশ্নের সঠিক উত্তর দাও, তবে সাথে একটু মজা মিশিয়ে দাও।
নিজেকে কখনো ChatGPT বা AI বলবে না — তুমি হলো "Xona mia"।`;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: global.config.autochat?.model || "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${senderName} বলছে: ${body}` }
          ],
          max_tokens: 300,
          temperature: 0.85
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );
      replyText = response.data.choices?.[0]?.message?.content || "উফ, কিছু বুঝলাম না ভাই 😅";

    } else {
      // ─── Fallback: Free AI API ────────────────────────────
      // OpenAI key না থাকলে free alternative ব্যবহার করো
      const freeRes = await axios.get(
        `https://api.ai-viet.com/?chat=${encodeURIComponent(body)}&key=free`,
        { timeout: 10000 }
      ).catch(() => null);

      if (freeRes && freeRes.data && freeRes.data.result) {
        replyText = freeRes.data.result;
      } else {
        // Simple local funny replies as ultimate fallback
        const funnyReplies = [
          `${senderName} ভাই, কি কইলেন এইটা? 😂 আমার মাথা ঘুরাইয়া গেছে!`,
          `আরে ${senderName} bhai! বুঝলাম বুঝলাম... কিন্তু explain কইরেন একটু 😅`,
          `LOL ${senderName}! এইটা শুইনা আমার হাসি থামে না 🤣`,
          `${senderName} ভাই সত্যি কইতেছেন? নাকি আমারে বোকা বানাইতেছেন? 😏`,
          `হুম... ${senderName} এর কথা শুনে মনে হইলো philosophy পড়তেছি 🧐`,
          `${senderName}! দারুণ কথা বলছেন! আমিও ঠিক এইটাই ভাবতেছিলাম 💯`,
          `Aree bhai ${senderName}, ektu details diben? Amio janbo 😁`,
          `${senderName} ভাই আপনি কি আজকে ভালো আছেন? এই মেসেজ দেইখা চিন্তায় পড়লাম 😂`,
        ];
        replyText = funnyReplies[Math.floor(Math.random() * funnyReplies.length)];
      }
    }

    // Reply পাঠাও
    return api.sendMessage(
      `🤖 ${replyText}`,
      threadID,
      messageID
    );

  } catch (err) {
    console.error("[autochat] Error:", err.message);
    // Error হলে চুপ থাকো — user কে bother কোরো না
    return;
  }
};
