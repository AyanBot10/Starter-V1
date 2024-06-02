const bot = require("./login.js");
const logger = require("../logger/usage.js");

const admins = global.config?.admins;
if (admins?.length === 0) {
  global.log("Admin not set, Commands may not function properly", "red", true)
}
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
    },
    Syntax: async function() {
      return await bot.sendMessage(msg.chat.id, `Invalid Usage, type \`/help ${command}\` to get the valid usage`)
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

      if ((x.config?.role && x.config?.role > 0) && !admins.includes(String(msg.from.id))) {
        return await bot.sendMessage(
          msg.chat.id,
          "You don't have perms to use this command"
        );
      }
      commandFound = true;
      await x.start({ event: msg, args, api: bot, message, cmd: x?.config?.name });
      const { username, id } = msg.from;
      logger(username, x.config.name, id, true, "Initiation");
      break;
    }
  }


  if (!commandFound) {
    await bot.sendMessage(msg.chat.id, "Come Again?");
  }
});

bot.on("message", async msg => {
  for (const x of global.cmds.values()) {
    const args = msg?.text?.split(" ")
    const { username, id } = msg.from;
    if (typeof x.chat === "function") {
      await x.chat({ event: msg, args, api: bot });
      logger(username, x.config.name, id, true, "Chat");
      break;
    }
  }
})

const handleFunctionalEvent = async (ctx, eventType) => {
  const { message, from } = ctx;
  const msg = message;
  if (global.bot?.[eventType].has(message?.message_id)) {
    let context = global.bot[eventType].get(message?.message_id);
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
      },
      Syntax: async function() {
        return await bot.sendMessage(msg.chat.id, `Invalid Usage, type \`/help ${context.cmd}\` to get the valid usage`)
      }
    }

    if (cmd && cmd[eventType]) {
      await cmd[eventType]({
        event: message,
        api: bot,
        ctx,
        Context: context,
        message: message_function,
        cmd: context?.cmd || cmd?.config?.name || null
      });
    }

    const { username, id } = from;
    logger(username, context.cmd, id, true, eventType);
  }
};

const handleEvents = async (ctx, eventType) => {
  const { username, id } = ctx?.from;
  if (ctx?.text?.startsWith("/")) return
  logger(username, "EVENT", id, true, eventType);
}

const functionalEvents = [
  "callback_query",
  "shipping_query",
  "pre_checkout_query",
  "inline_query",
  "chosen_inline_result",
  "chat_join_request"
];

const chatEvents = [
  //"message",
  // `message` logs every event
  "text",
  "edited_message",
  "channel_post",
  "edited_channel_post",
  "poll",
  "poll_answer",
  "chat_member",
  "my_chat_member",
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

functionalEvents.forEach(eventType => {
  bot.on(eventType, async (ctx) => handleFunctionalEvent(ctx, eventType));
});

chatEvents.forEach(eventType => {
  bot.on(eventType, async (ctx) => handleEvents(ctx, eventType));
});

module.exports = bot;