const bot = require("./login.js");
let api = bot;

function create_message(msg, command) {
  return {
    send: async function(text, options = {}) {
      try {
        if (!text) throw new Error("Must include Body");
        if (typeof options !== 'object') options = {};
        return await bot.sendMessage(msg.chat.id, text, options);
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message);
        return null;
      }
    },
    reply: async function(text, options = {}) {
      try {
        if (!text) throw new Error("Must include Body");
        if (typeof options !== 'object') options = {};
        options['reply_to_message_id'] = msg.message_id;
        return await bot.sendMessage(msg.chat.id, text, options);
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message);
        return null;
      }
    },
    unsend: async function(options) {
      try {
        if (!options.message_id) throw new Error("Include message_id");
        return await api.deleteMessage(msg.chat.id, options.message_id);
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message);
        return null;
      }
    },
    Syntax: async function() {
      return await bot.sendMessage(msg.chat.id, `Invalid Usage, Check usage from help command`, { reply_to_message_id: msg.message_id });
    },
    react: async function(emoji_array, message_id, is_big = true) {
      // [{ type: 'emoji', emoji: '👍' }];
      emoji_array.forEach(item => {
        if (global.react_emojis.includes(item.emoji)) {
          item.emoji = "💩";
        }
      });
      return await api.setMessageReaction(msg.from.id, message_id, { reaction: emoji_array, is_big })
    }
  };
}

module.exports = { create_message };