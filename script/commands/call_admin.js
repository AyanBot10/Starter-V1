const config = global.config_handler;

module.exports = {
  config: {
    name: "calladmin",
    aliases: ["callad"],
    description: "Call an Admin and have a talk with them",
    usage: "{pn} <message>",
    category: "support"
  },
  start: async function({ args, event, api, message, cmd }) {
    if (!config.admins || config.admins.length === 0) return message.reply("No Admins Set");
    if (!args[0] && !event.message) return message.Syntax(cmd);

    const text = args.join(' ') || (event.message && event.message.caption) || '';
    const form = `User @${event.from.username} (${event.from.id}) Called for admin\n\n*${text}*`;

    for (let admin of config.admins) {
      let sentMessage;
      sentMessage = await api.sendMessage(admin, form, { parse_mode: "Markdown", disable_notification: false });

      global.bot.reply.set(sentMessage.message_id, {
        cmd,
        ctx: sentMessage,
        messageID: sentMessage.message_id,
        who: "userToAdmin",
        sent_event: event
      });
      await global.utils.sleep(650);
    }
    await message.reply("Sent your message to the admins.", { disable_notification: true });
  },
  reply: async function({ message, event, args, Context, api }) {
    let { cmd, messageID, who, ctx, sent_event } = Context;

    const text = event.text || "No Text";
    if (!text) return;

    switch (who) {
      case 'userToAdmin': {
        const form = `Admin @${event.from.username} (${event.from.id}) Replied:\n${text}`;
        let sentMessage;
        sentMessage = await api.sendMessage(sent_event.chat.id, form, { reply_to_message_id: sent_event.message_id, disable_notification: false });
        global.bot.reply.set(sentMessage.message_id, {
          cmd,
          ctx: sentMessage,
          messageID: sentMessage.message_id,
          who: "adminToUser",
          sent_event: event
        });
        delete global.bot.reply[messageID];
        return await message.reply("Sending reply to user...", { disable_notification: true });
      }
      case 'adminToUser': {
        const form = `User @${event.from.username} (${event.from.id}) Replied:\n${text}`;
        let sentMessage;
        sentMessage = await api.sendMessage(sent_event.chat.id, form, { reply_to_message_id: sent_event.message_id, disable_notification: false });
        global.bot.reply.set(sentMessage.message_id, {
          cmd,
          ctx: sentMessage,
          messageID: sentMessage.message_id,
          who: "userToAdmin",
          sent_event: event
        });
        delete global.bot.reply[messageID];
        return await message.reply("Sent reply to admin.", { disable_notification: true })
      }
    }
  }
};