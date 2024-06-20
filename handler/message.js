"use strict"

const bot = require("./login.js");
let api = bot;

function create_message(msg, isCtx) {
  return {
    send: async function(text, options = {}) {
      try {
        if (!text) throw new Error("Must include Body");
        if (typeof options !== 'object') options = {};
        return await bot.sendMessage(isCtx ? msg.message?.chat?.id || msg.chat.id : msg.chat.id, text, options);
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message);
        return null;
      }
    },
    reply: async function(text, options = {}) {
      let replyTo = isCtx ? msg.message?.chat?.id || msg.chat.id : msg.chat.id
      try {
        if (!text) throw new Error("Must include Body");
        if (typeof options !== 'object') options = {};
        if (replyTo)
          options['reply_to_message_id'] = replyTo
        return await bot.sendMessage(replyTo, text, options);
      } catch (err) {
        await bot.sendMessage(replyTo, err.message);
        return null;
      }
    },
    unsend: async function(textID, tid = isCtx ? msg.message?.chat?.id || msg.chat.id : msg.chat.id) {
      try {
        if (!textID) throw new Error("Include message_id");
        return await api.deleteMessage(tid || msg.chat.id, textID);
      } catch (err) {
        await bot.sendMessage(tid, err.message);
        return null;
      }
    },
    Syntax: async function(text = null, body) {
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
    react: async function(text, message_id = msg.message_id, is_big = false) {
      let emoji = text || "👍";
      let to_react = [{ type: 'emoji', emoji }];
      if (!global.react_emojis.includes(emoji)) {
        emoji = global.react_emojis[Math.floor(Math.random() * global.react_emojis.length)];
        to_react = [{ type: 'emoji', emoji }];
      }

      return await api.setMessageReaction(msg.from.id, message_id, { reaction: to_react, is_big });
    },
    indicator: async function(text = "typing", tid) {
      try {
        return await api.sendChatAction(tid || msg?.chat?.id, text)
      } catch (error) {}
    },
    edit: async function(text, message_id, chat_id = isCtx ? msg.message?.chat?.id || msg.chat.id : msg.chat.id, options) {
      return api.editMessageText(text, { chat_id, message_id, ...options })
    }
  };
}

module.exports = { create_message };