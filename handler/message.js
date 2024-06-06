const bot = require("./login.js");
let api = bot;

function create_message(msg) {
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
    handleText: async function(text = false, msg, body = "Invalid Usage") {
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
      const helpButton = await bot.sendMessage(msg.chat.id, body, {
        reply_to_message_id: msg.message_id,
        ...options
      });
      return global.bot.callback_query.set(helpButton.message_id, {
        event: msg,
        ctx: helpButton,
        cmd: "help",
        message_id: helpButton.message_id,
        cmd_file: cmd.toLowerCase()
      })
    },
    Syntax: async function(text = null, options) {
      this.handleText(text, msg, options)
    },
    react: async function(text, message_id = msg.message_id, is_big = false) {
      let emoji = text || "👍";
      let to_react = [{ type: 'emoji', emoji }];
      if (!global.react_emojis.includes(emoji)) {
        emoji = global.react_emojis[Math.floor(Math.random() * global.react_emojis.length)];
        to_react = [{ type: 'emoji', emoji }];
      }

      return await api.setMessageReaction(msg.from.id, message_id, { reaction: to_react, is_big });
    },
    indicator: async function(text = "typing") {
      try {
        return await api.sendChatAction(msg.chat.id, text)
      } catch (error) {}
    },
    edit: async function(text, message_id, chat_id = msg.chat.id, options) {
      return api.editMessageText(text, { chat_id, message_id, ...options })
    }
  };
}

module.exports = { create_message };