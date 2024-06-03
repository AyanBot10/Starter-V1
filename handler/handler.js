const bot = require("./login.js");
const logger = require("../logger/usage.js");
const { create_message } = require("./message.js");
const admins = global.config?.admins;
if (admins?.length === 0) {
  global.log("Admin not set, Commands may not function properly", "red", true)
}

bot.onText(/\/(\w+)/, async (msg, match) => {
  if (msg.from.bot_id) return;

  if (msg.chat.type !== "private" && global.config.chat.level === "private") {
    if (global.config.chat.message) {
      bot.sendMessage(msg.chat.id, global.config.chat.message);
    }
    return;
  }
  const command = match[1];
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
      const message = create_message(msg, x.config.name);
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
  if (msg.from.bot_id) return;
  for (const x of global.cmds.values()) {
    const args = msg?.text?.split(" ")
    const { username, id } = msg.from;
    if (typeof x.chat === "function") {
      const message = create_message(msg, x.config.name);
      await x.chat({ event: msg, args, api: bot, message, cmd: x.config.name });
      logger(username, x.config.name, id, true, "Chat");
      break;
    }
  }
})

const handleFunctionalEvent = async (ctx, eventType) => {
  const { message, from } = ctx;
  if (global.bot?.[eventType].has(message?.message_id)) {
    let context = global.bot[eventType].get(message?.message_id);
    const cmd = Array.from(global.cmds.values()).find(
      cmd => cmd.config.name === context.cmd
    );
    const message_function = create_message(ctx, cmd.config.name);
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