module.exports.config = {
	name: "unsend",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "XTﾠMꫝɪᴍﾠ!!",
	description: "Gỡ tin nhắn của bot",
	commandCategory: "system",
	usages: "unsend",
	cooldowns: 0
};

module.exports.languages = {
	"vi": {
		"returnCant": "Không thể gỡ tin nhắn của người khác.",
		"missingReply": "Hãy reply tin nhắn cần gỡ."
	},
	"en": {
		"returnCant": "আরে বলদ অন্য কারো মেসেজ আমি আনসেন্ড করবো কিভাবে পাগল ছাগল",
		"missingReply": "আপনি আমার কোন মেসেজটি আনসেন্ড করবেন , তা রিপ্লাই করুন 🌺"
	}
}

module.exports.run = function({ api, event, getText }) {
	if (event.messageReply.senderID != api.getCurrentUserID()) return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
	if (event.type != "message_reply") return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
	return api.unsendMessage(event.messageReply.messageID);
	}
