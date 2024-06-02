const bot = require("./login.js");
const logger = require("../logger/usage.js");

const admins = [];

bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];

  const message = {
    send: async function(text, options) {
      try {
        if (!text) throw new Error("Must include Body")
        if (typeof options !== 'object') options = {}
        return await bot.sendMessage(msg.chat.id, text, options)
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message)
        return null
      }
    },
    reply: async function(text, options) {
      try {
        if (!text) throw new Error("Must include Body")
        if (typeof options !== 'object') options = {}
        options['reply_to_message_id'] = msg.message_id
        return await bot.sendMessage(msg.chat.id, text, options)
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message)
        return null
      }
    },
    unsend: async function(options) {
      try {
        if (!options.message_id) throw new Error("Include message_id")
        return await api.deleteMessage(event.chat.id, options.message_id)
      } catch (err) {
        await bot.sendMessage(msg.chat.id, err.message)
        return null
      }
    }
  }

  const args = msg.text.split(" ").slice(1);
  let commandFound = false;

  for (const x of global.cmds.values()) {
    if (
      x.config.name?.toLowerCase() === command?.toLowerCase() ||
      (x.config?.aliases &&
        x.config?.aliases.some(
          alias => alias.toLowerCase() === command.toLowerCase()
        ))
    ) {

      if ((x.config?.role && x.config?.role > 0) && !admins.includes(msg.from.id)) {
        return await bot.sendMessage(
          msg.chat.id,
          "You don't have perms to use this command"
        );
      }
      commandFound = true;
      await x.start({ event: msg, args, api: bot, message, cmd: x?.config?.name });
      const { username, id } = msg.from;
      const groupId =
        msg.chat?.type === "group" || msg.chat?.type === "supergroup" ?
        msg.chat.id :
        null;
      logger(username, x.config.name, id, groupId, true, "Initiation");

      break;
    }
  }

  if (!commandFound) {
    await bot.sendMessage(msg.chat.id, "Come Again?");
  }
});


bot.on("text", async msg => {
  const { username, id } = msg.from;
  const groupId =
    msg.chat?.type === "group" || msg.chat?.type === "supergroup" ?
    msg.chat.id :
    null;

  if (process.env["CONNECT_DB"] == "true" && global.update) {
    await global.update(msg);
  }

  if (process.env["LOGGER"] != "false") {
    if (msg?.text?.startsWith("/")) return;
    logger(username, msg.text.substring(0, 100), id, groupId, "Text");
  }
});

const handleEvent = async (ctx, eventType) => {
  const { message, from } = ctx;
  const msg = message;
  if (global.bot[eventType].has(message.message_id)) {
    let context = global.bot[eventType].get(message.message_id);
    const cmd = Array.from(global.cmds.values()).find(
      cmd => cmd.config.name === context.cmd
    );

    const message_function = {
      send: async function(text, options) {
        try {
          if (!text) throw new Error("Must include Body")
          if (typeof options !== 'object') options = {}
          return await bot.sendMessage(msg.chat.id, text, options)
        } catch (err) {
          await bot.sendMessage(msg.chat.id, err.message)
          return null
        }
      },
      reply: async function(text, options) {
        try {
          if (!text) throw new Error("Must include Body")
          if (typeof options !== 'object') options = {}
          options['reply_to_message_id'] = msg.message_id
          return await bot.sendMessage(msg.chat.id, text, options)
        } catch (err) {
          await bot.sendMessage(msg.chat.id, err.message)
          return null
        }
      },
      unsend: async function(options) {
        try {
          if (!options.message_id) throw new Error("Include message_id")
          return await api.deleteMessage(event.chat.id, options.message_id)
        } catch (err) {
          await bot.sendMessage(msg.chat.id, err.message)
          return null
        }
      }
    }

    if (cmd && cmd[eventType]) {
      await cmd[eventType]({
        event: message,
        api: bot,
        ctx,
        Context: context,
        message: message_function
      });
    }

    const { username, id } = from;
    const groupId =
      message?.chat?.type === "group" ||
      message?.chat?.type === "supergroup" ?
      message.chat.id :
      null;
    logger(username, context.cmd, id, groupId, true, eventType);
  }
};

const events = [
  "message",
  "edited_message",
  "channel_post",
  "edited_channel_post",
  "inline_query",
  "chosen_inline_result",
  "callback_query",
  "shipping_query",
  "pre_checkout_query",
  "poll",
  "poll_answer",
  "chat_member",
  "my_chat_member",
  "chat_join_request",
  "audio",
  "document",
  "photo",
  "sticker",
  "video",
  "video_note",
  "voice",
  "contact",
  "location",
  "venue",
  "new_chat_members",
  "left_chat_member",
  "new_chat_title",
  "new_chat_photo",
  "delete_chat_photo",
  "group_chat_created",
  "supergroup_chat_created",
  "channel_chat_created",
  "migrate_to_chat_id",
  "migrate_from_chat_id",
  "pinned_message"
];

events.forEach(eventType => {
  bot.on(eventType, async (ctx) => handleEvent(ctx, eventType));
});

module.exports = bot;