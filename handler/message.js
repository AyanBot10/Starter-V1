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
      return await bot.sendMessage(msg.chat.id, `Invalid Usage, type \`/help ${command}\` to get the valid usage`);
    },
    react: async function(emoji_array, message_id) {
      // [{ type: 'emoji', emoji: '👍' }];
      return await api.setMessageReaction(msg.from.id, message_id, { reaction: emoji_array , is_big: true })
    }
  };
}

module.exports = { create_message };