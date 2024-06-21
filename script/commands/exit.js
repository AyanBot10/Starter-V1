module.exports = {
  config: {
    name: "exit",
    aliases: ["kill"],
    description: "Kills Instance gracefully",
    role: 1,
    category: "system"
  },
  start: async function({ event, api, message, cmd }) {
    const sent = await message.reply("Are you sure you want to kill this instance?", {
      reply_markup: {
        inline_keyboard: [
      [{ text: 'Yeah', callback_data: 'confirm' }, { text: 'Nah', callback_data: 'cancel' }]
    ]
      }
    });
    global.bot.callback_query.set(sent.message_id, {
      cmd,
      author: event.from.id,
      ctx: sent,
      messageID: sent.message_id,
      chat: event.chat.id,
      author_message: event.message_id
    });
  },
  callback_query: async function({ event, ctx, Context, message, api }) {
    const { author, messageID, chat, author_message } = Context;
    await api.answerCallbackQuery({ callback_query_id: ctx.id });
    if (author != ctx.from.id) return message.send("Unauthorized");
    switch (ctx.data) {
      case 'confirm': {
        await message.edit("Confirmed, Exiting Process", messageID, chat, {
          reply_markup: { inline_keyboard: [] }
        });
        await api.stopPolling()
        global.log("Exited Process", "red", true)
        process.exit(3);
        break;
      }
      case 'cancel': {
        await message.edit("That's what I thought", messageID, chat, {
          reply_markup: { inline_keyboard: [] }
        })
        delete global.bot.callback_query[messageID]
        break;
      }
    }
  }
}