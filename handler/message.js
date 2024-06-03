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
    unsend: async function(text) {
      try {
        if (!text) throw new Error("Include message_id");
        return await api.deleteMessage(msg.chat.id, text);
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message);
        return null;
      }
    },
    handleText: async function(text = null, msg) {
      let cmd = text || "help";
      const button = {
        text: cmd.toUpperCase(),
        callback_data: cmd.toLowerCase()
      };
      const options = {
        reply_markup: {
          inline_keyboard: [[button]]
        }
      };
      const helpButton = await bot.sendMessage(msg.chat.id, `Invalid Usage, Check usage from help command`, {
        reply_to_message_id: msg.message_id,
        ...options
      });
      return global.bot.callback_query.set(helpButton.message_id, {
        event: msg,
        ctx: helpButton,
        message_id: helpButton.message_id,
        cmd_file: cmd.toLowerCase()
      })
    },
    Syntax: async function(text = null) {
      this.handleText(text, msg)
    },
    react: async function(emoji, message_id, is_big = false) {
      let to_react = [{ type: 'emoji', emoji }]
      if (global.react_emojis.some(emoji)) to_react.emoji = global.react_emojis[Math.floor(Math.random() * global.react_emojis)]
      return await api.setMessageReaction(msg.from.id, message_id, { reaction: to_react, is_big })
    }
  };
}

module.exports = { create_message };