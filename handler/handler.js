const bot = require("./login.js");
const logger = require("../logger/usage.js");
const { create_message } = require("./message.js");
const admins = global.config?.admins;
if (admins?.length === 0) {
  global.log("Admin not set", "red", true)
}

bot.onText(/\/(\w+)/, async (msg, match) => {
  try {
    if (msg.from.bot_id) return;
    if (global.config?.level?.some(msg.chat.type)) return

    const command = match[1];
    const args = msg.text.split(" ").slice(1);
    let commandFound = false;
    if (global.config["use_sqlite_on_start"]) {
      let check = global.users.has(msg.from.id);
      if (!check) {
        check = await global.sqlite.exists(msg.from.id);
      }
      if (!check) {
        await global.sqlite.create(msg.from.id)
        await global.sqlite.update(msg.from.id, {
          ...msg.from
        })
      }
    }

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
            "You don't have perms to use this command",
            {
              reply_to_message_id: msg.message_id
            }
          );
        }
        commandFound = true;
        const message = create_message(msg, x.config.name);
        await x.start({ event: msg, args, api: bot, message, cmd: x?.config?.name, usersData: global.sqlite });

        const { username, id } = msg.from;
        logger(username, x.config.name, id, true, "Initiation");
        break;
      }
    }

    if (!commandFound) {
      await bot.sendMessage(msg.chat.id, "Come Again?");
    }
  } catch (err) {
    throw err
  }
});

bot.on("message", async msg => {
  let event = msg;
  let api = bot;
  if (msg?.text?.startsWith("/")) return
  try {
    if (reply_to_message) {
      if (global.bot.reply.has(msg.reply_to_message.message_id)) {
        const replyCTX = global.bot.reply.get(msg.reply_to_message.message_id)
        for (const x of global.cmds.values()) {
          if (x.config.name === replyCTX.cmd) {
            const args = msg?.text?.split(" ")
            const { username, id } = msg.from;
            if (msg.from.bot_id) break;
            const message = create_message(msg, x.config.name);
            await x.reply({ event: msg, args, api: bot, message, cmd: x.config.name, usersData: global.sqlite });
            logger(username, x.config.name, id, true, "Reply");
            break;
          }
        }
      }
    }
    for (const x of global.cmds.values()) {
      const args = msg?.text?.split(" ")
      const { username, id } = msg.from;
      if (typeof x.chat === "function") {
        const message = create_message(msg, x.config.name);
        if (msg.from.bot_id) break;
        await x.chat({ event: msg, args, api: bot, message, cmd: x.config.name, usersData: global.sqlite });
        logger(username, x.config.name, id, true, "Chat");
        break;
      }
    }
  } catch (err) {
    throw err
  }
})

const handleFunctionalEvent = async (ctx, eventType) => {
  try {
    const { message, from } = ctx;
    if (global.bot?.[eventType].has(message?.message_id)) {
      let context = global.bot[eventType].get(message?.message_id);
      for (const cmd of global.cmds.values()) {
        if (
          cmd?.config.name?.toLowerCase() === context.cmd) {
          const message_function = create_message(ctx, cmd.config.name);
          if (cmd && cmd[eventType]) {
            await cmd[eventType]({
              event: message,
              api: bot,
              ctx,
              Context: context,
              message: message_function,
              cmd: context?.cmd || cmd?.config?.name || null,
              usersData: global.sqlite
            });
          }
          const { username, id } = from;
          logger(username, context.cmd, id, true, eventType);
        }
      }
    }
  } catch (err) { throw err }
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
  try {
    bot.on(eventType, async (ctx) => handleFunctionalEvent(ctx, eventType));
  } catch (err) {
    throw err
  }
});

chatEvents.forEach(eventType => {
  try {
    bot.on(eventType, async (ctx) => handleEvents(ctx, eventType));
  } catch (err) {
    throw err
  }
});

module.exports = bot;
