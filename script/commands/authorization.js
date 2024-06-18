module.exports = {
  config: {
    name: "authorization",
    description: "Authorization Policies Panel",
    category: "system"
  },
  start: async function({ role, event, api, message, cmd, args }) {
    if (role !== 1) return message.reply("Unauthorized");
    if (!args[0]) return message.reply(`Choose /authorization on or off.`);

    switch (args[0]?.toLowerCase()) {
      case 'on': {
        global.utils.configSync({ authorization_prompt: true });
        return message.reply("Enabled Authorization Policies Promoting");
      }
      case 'off': {
        global.utils.configSync({ authorization_prompt: false });
        return message.reply("Disabled Authorization Policies Promoting");
      }
      default: {
        return message.reply("Invalid Choice");
      }
    }
  },
  callback_query: async function({ event, ctx, Context, message, api, usersData }) {
    try {
      const { id, from, message: ctxMessage, data } = ctx;
      const { author, messageID } = Context;
      const { chat, message_id } = ctxMessage;
      await api.answerCallbackQuery({ callback_query_id: id });

      if (author != from.id) {
        return api.sendMessage(chat.id, `@${from.username || from.first_name} Unauthorized`);
      }

      if (global.bot.callback_query && message_id in global.bot.callback_query) {
        delete global.bot.callback_query[messageID];
      }
      switch (data) {
        case 'confirm': {
          await message.edit(`Confirmed Choice. Adding @${from.username || from.first_name} to Database`, message_id, chat.id, {
            reply_markup: { inline_keyboard: [] }
          });
          global.sqlite.usersData.update(from.id, { authorized: true });
          break;
        }
        case 'cancel': {
          await message.edit(`Confirmed Choice. @${from.username || from.first_name} cannot use any slash interactions until they agree to the policies`, message_id, chat.id, {
            reply_markup: { inline_keyboard: [] }
          });
          break;
        }
        default: {
          await api.sendMessage(chat.id, "Invalid action");
        }
      }
    } catch (err) {
      console.warn('Error in authorization callback_query:', err);
    }
  }
}