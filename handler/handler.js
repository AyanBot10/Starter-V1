const bot = require("./login.js");
const logger = require("../logger/usage.js");
const { create_message } = require("./message.js");
const fs = require("fs");
const restartJson = require("./restart.json");
const path = require("path");

function ms_difference(startTime, endTime) {
  return ((endTime - startTime) / 1000).toFixed(1);
}

if (restartJson?.legit) {
  const { time_ms, chat_id, author_message } = restartJson.event;
  const secondsTook = ms_difference(time_ms, Date.now());
  bot.sendMessage(chat_id, `Restarted. Time Taken: ${secondsTook}s`, { reply_to_message_id: author_message, disable_notification: false })
  fs.writeFileSync(path.join(__dirname, "restart.json"), JSON.stringify({
    legit: false,
    event: {}
  }, null, 2))
}

const admins = global.config_handler?.admins;
if (admins?.length === 0) {
  global.log("Admin not set", "red", true)
}

bot.onText(/\/(\w+)/, async (msg, match) => {
  try {
    if (msg.from.bot_id) return;
    if (!global.config?.chat?.level.includes(msg.chat.type)) {
      if (global.config.chat.message) {
        await bot.sendMessage(msg.chat.id, global.config.chat.message, { reply_to_message_id: msg.message_id })
      }
      return
    }
    if (global.config_handler.adminOnly.toggle) {
      if (!admins.includes(msg.from.id)) {
        return global.config_handler.adminOnly.toggle_message.length > 2 ? bot.sendMessage(msg.chat.id, global.config_handler.adminOnly.toggle_message, { reply_to_message_id: msg.message_id }) : null
      }
    }
    const message = create_message(msg);
    const command = match[1];
    const args = msg.text.split(" ").slice(1);
    let commandFound = false;
    if (global.config["use_sqlite_on_start"]) {
      let check = await global.sqlite.usersData.exists(msg.from.id)
      let threadCheck = await global.sqlite.threadsData.exists(msg.chat.id);
      if (!check) {
        global.sqlite.usersData.refresh(msg.from.id, msg)
      }
      if (!threadCheck) {
        global.sqlite.threadsData.refresh(msg.chat.id, msg)
      }
      const userIsBanned = (await global.sqlite.usersData.retrieve(msg.from.id))
      if (userIsBanned?.isBanned) return message.reply(userIsBanned?.ban_message || "You have been banned from the system.")
      //   const bannedThread = (await global.sqlite.threadsData.retrieve(msg.chat.id))?.isBanned || false;
    }
    const bannedThread = global.config_handler.banned_threads.chats.includes(msg.chat.id)
    return bannedThread ? message.reply(global.config_handler.banned_threads.message) : null
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
        if (global.config_handler.skip.includes(x.config.name)) return message.send(global.config_handler.skip_message || "Command is Unloaded")
        const userId = msg.from.id;
        const commandName = x.config.name;
        const cooldown = x.config?.cooldown * 1000 || 5000;
        if (!global.cooldown.has(userId)) {
          global.cooldown.set(userId, new Map());
        }
        const userCooldowns = global.cooldown.get(userId);
        if (userCooldowns.has(commandName)) {
          const lastUsed = userCooldowns.get(commandName);
          const now = Date.now();
          if (now < lastUsed + cooldown) {
            const remainingTime = ((lastUsed + cooldown - now) / 1000).toFixed(1);
            return bot.sendMessage(msg.chat.id, `Cooldown: ${remainingTime}s Remaining`, { reply_to_message_id: msg.message_id });
          }
        }
        userCooldowns.set(commandName, Date.now());
        x.start({ event: msg, args, api: bot, message, cmd: x?.config?.name, usersData: global.sqlite.usersData, threadsData: global.sqlite.threadsData });
        const { username, id } = msg.from;
        logger({ name: username, command: x.config.name, uid: id, type: msg?.chat?.type || null, event: "initiation" });
        break;
      }
    }
    if (!commandFound) {
      message.reply("Command Not Found")
    }
  } catch (err) {
    throw err
  }
});

bot.on("message", async msg => {
  let event = msg;
  let api = bot;
  if (msg.text && msg.text.startsWith("/")) return
  let replied = false;
  try {
    if (msg.reply_to_message) {
      if (global.bot.reply.has(msg.reply_to_message.message_id)) {
        const replyCTX = global.bot.reply.get(msg.reply_to_message.message_id)
        for (const x of global.cmds.values()) {
          if (x.config.name === replyCTX.cmd) {
            replied = true;
            const args = msg?.text?.split(" ")
            const { username, id } = msg.from;
            if (msg.from.bot_id) break;
            const message = create_message(msg, x.config.name);
            await x.reply({ event: msg, args, api: bot, message, cmd: x.config.name, usersData: global.sqlite.usersData, Context: replyCTX, threadsData: global.sqlite.threadsData });
            logger({ name: username, command: x.config.name, uid: id, type: msg?.chat?.type || null, event: "message_reply" });
            break;
          }
        }
      }
    }
    if (!replied) {
      for (const x of global.cmds.values()) {
        const args = msg?.text?.split(" ")
        const { username, id } = msg.from;
        if (typeof x.chat === "function") {
          const message = create_message(msg, x.config.name);
          if (msg.from.bot_id) break;
          x.chat({ event: msg, args, api: bot, message, cmd: x.config.name, usersData: global.sqlite.usersData, threadsData: global.sqlite.threadsData });
          logger({
            name: username,
            command: x.config.name,
            uid: id,
            type: msg.chat.type,
            event: "message"
          });
          break;
        }
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
          const message_function = create_message(ctx);
          if (cmd && cmd[eventType]) {
            cmd[eventType]({
              event: message,
              api: bot,
              ctx,
              Context: context,
              message: message_function,
              cmd: context?.cmd || cmd?.config?.name || null,
              usersData: global.sqlite.usersData,
              threadsData: global.sqlite.threadsData
            });
          }
          const { username, id } = from;
          logger({ name: username, command: context.cmd, uid: id, type: ctx?.chat?.type || null, event: eventType });
        }
      }
    }
  } catch (err) { throw err }
};

const handleEvents = async (ctx, eventType) => {
  const { username, id } = ctx?.from;
  if (ctx?.text?.startsWith("/")) return
  logger({ name: username, command: null, uid: id, type: ctx?.chat?.type || null, event: eventType });
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
    if (global.config.log_events) {
      bot.on(eventType, async (ctx) => handleEvents(ctx, eventType));
    }
  } catch (err) {
    throw err
  }
});

module.exports = bot;