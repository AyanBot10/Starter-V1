const config = global.config_handler;

module.exports = {
  config: {
    name: "calladmin",
    aliases: ["callad"],
    description: "Call an Admin and have a talk with them",
    usage: "{pn} <message>"
  },
  start: async function({ args, event, api, message, cmd }) {
    if (!config.admins || config.admins.length === 0) return message.reply("No Admins Set");
    if (!args[0] && !event.message) return message.Syntax(cmd);

    const text = args.join(' ') || (event.message && event.message.caption) || '';
    const media = undefined;
    const form = `User @${event.from.username} (${event.from.id})\nCalled for admin.\nText:\n${text}`;

    for (let admin of config.admins) {
      let sentMessage;
      if (media) {
        const mediaType = media.photo ? 'photo' : media.video ? 'video' : 'document';
        sentMessage = await api.sendMedia(admin, media.file_id, { caption: form, media_type: mediaType });
      } else {
        sentMessage = await api.sendMessage(admin, form);
      }

      global.bot.reply.set(sentMessage.message_id, {
        cmd,
        ctx: sentMessage,
        messageID: sentMessage.message_id,
        who: "userToAdmin",
        sent_event: event
      });
      await global.utils.sleep(650);
    }
    await message.reply("Sending your message to the admins...");
  },
  reply: async function({ message, event, args, Context, api }) {
    let { cmd, messageID, who, ctx, sent_event } = Context;

    const text = event.text || (event.message && event.message.caption) || '';
    const replyToMessage = undefined
    const media = undefined

    if (!text && !media) return;

    switch (who) {
      case 'userToAdmin': {
        const form = `Admin ${event.from.username} (${event.from.id})\nReplied:\n${text}`;
        let sentMessage;
        if (media) {
          const mediaType = media.photo ? 'photo' : media.video ? 'video' : 'document';
          sentMessage = await api.sendMedia(sent_event.chat.id, media.file_id, { caption: form, reply_to_message_id: sent_event.message_id, media_type: mediaType });
        } else {
          sentMessage = await api.sendMessage(sent_event.chat.id, form, { reply_to_message_id: sent_event.message_id });
        }

        global.bot.reply.set(sentMessage.message_id, {
          cmd,
          ctx: sentMessage,
          messageID: sentMessage.message_id,
          who: "adminToUser",
          sent_event: event
        });
        delete global.bot.reply[messageID];
        return await message.reply("Sending reply to user...");
      }
      case 'adminToUser': {
        const form = `User ${event.from.username} (${event.from.id})\nReplied with:\n${text}`;
        let sentMessage;
        if (media) {
          const mediaType = media.photo ? 'photo' : media.video ? 'video' : 'document';
          sentMessage = await api.sendMedia(sent_event.chat.id, media.file_id, { caption: form, reply_to_message_id: sent_event.message_id, media_type: mediaType });
        } else {
          sentMessage = await api.sendMessage(sent_event.chat.id, form, { reply_to_message_id: sent_event.message_id });
        }

        global.bot.reply.set(sentMessage.message_id, {
          cmd,
          ctx: sentMessage,
          messageID: sentMessage.message_id,
          who: "userToAdmin",
          sent_event: event
        });
        delete global.bot.reply[messageID];
        return await message.reply("Sending reply to admin...");
      }
    }
  }
};