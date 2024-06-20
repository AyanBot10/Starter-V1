"use strict"

const bot = require("./login.js");
const logger = require("../logger/usage.js");
const { create_message } = require("./message.js");
const fs = require("fs");
const restartJson = require("./restart.json");
const path = require("path");

function ms_difference(startTime, endTime) {
  return ((endTime - startTime) / 1000).toFixed(1);
}

if (config.DATABASE.mongodb['CONNECT_MONGODB']) {
  global.usersData = global.mongo.usersData;
  global.threadsData = global.mongo.threadsData;
} else if (config.DATABASE.sqlite['CONNECT_SQLITE']) {
  global.usersData = global.sqlite.usersData;
  global.threadsData = global.sqlite.threadsData;
} else {
  global.log("NO DATABASE SELECTED", "red", true)
  process.exit(2);
}


async function initializeCommands() {
  var log = global.log;
  var commandsPath = path.resolve("script", "commands");
  var commandFiles;
  try {
    commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  } catch (error) {
    throw error;
  }

  const commandsArray = commandFiles.map(file => {
    var command = require(`./${commandsPath}/${file}`);
    if (!global.cmds.has(file)) return null;

    var { name, description } = command.config;
    if (!name) return null;

    return {
      command: name,
      description: description?.short || description?.long || (typeof description === 'string' ? description : 'Not Available')
    };
  }).filter(Boolean);

  try {
    await bot.setMyCommands(commandsArray);
    return true;
  } catch (error) {
    console.error(error);
    return null
  }
}

if (global.config.BOT["INITIALIZE_COMMANDS_ON_START"]) initializeCommands();

function clearCache() {
  const dir = path.resolve('script', 'commands', 'tmp');

  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        fs.unlinkSync(filePath);
      } else if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      }
    });
    if (global.config_handler.auto_clean.log)
      global.log('Cleared Cache: All files and directories in tmp have been removed.', 'magenta');
  } catch (err) {
    global.log(`Failed to clear cache: ${err.message}`, 'red');
  }
}

if (global.config_handler.auto_clean.toggle) {
  const interval = !isNaN(global.config_handler.auto_clean.time) ? global.config_handler.auto_clean.time : 1800000;
  setInterval(clearCache, interval);
  global.log(`Cache cleaner in effect, Interval: ${(interval / 1000 / 60).toFixed(0)} minutes`, 'yellow');
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
    let check = await usersData.exists(msg.from.id)
    if (!check) {
      usersData.refresh(msg.from.id, msg)
      global.log(`New User: @${msg.from.username || msg.from.first_name}`, "yellow", true)
      usersData.update(msg.from.id, { authorized: false })
    }
    const userIsBanned = (await usersData.retrieve(msg.from.id))

    if (!userIsBanned.authorized && global.config_handler.authorization_prompt) {
      const authorizationMessage = await message.reply(`
  By accessing or using our services, you acknowledge and agree to the following:

   Interactions: Your interactions, including the initialization and execution of commands, may be recorded for analysis and optimization.
   Data Storage: Any data you provide may be securely stored and processed for record-keeping and future analysis.
   Purpose: Our services are for entertainment purposes only and should not be relied upon for any other use.
   Privacy: Group logs may capture metadata (excluding content) for privacy and security reasons.
   Consent: User consent is required for data sharing beyond stated purposes, as per our privacy policy.
   Data Retention: We follow data retention policies to comply with regulations and protect user information.
   Enhancements: Collected data will be used to enhance user experience, improve service quality, and personalize interactions.
   User Rights: You have the right to request access to, deletion, or modification of your stored data.
   Security: Measures such as encryption, access controls, and regular audits will be employed to safeguard user data.
   Admin Requests: Use the \`calladmin\` command to report or request changes regarding your data.
   Content Storage: The bot will not store any content sent in chats.

  You will be able to use the commands once you agree to these terms.
  `, {
        reply_markup: {
          inline_keyboard: [
        [{ text: 'Agree', callback_data: 'confirm' },
              { text: 'Disagree', callback_data: 'cancel' }]
      ]
        }
      });

      return global.bot.callback_query.set(authorizationMessage.message_id, {
        cmd: "authorization",
        author: msg.from.id,
        messageID: authorizationMessage.message_id
      });
    }

    if (userIsBanned?.isBanned) return message.reply(`You have been banned\nReason: ${userIsBanned?.ban_message}` || "You have been banned from the system.")
    if (msg.chat.type !== "private") {
      let threadCheck = await threadsData.exists(msg.chat.id);
      if (!threadCheck) {
        threadsData.refresh(msg.chat.id, msg)
      }
      let bannedThread = await threadsData.retrieve(msg.chat.id)
      if (bannedThread?.isBanned) {
        return message.reply(bannedThread?.ban_message ? `Chat is Banned\nReason: ${bannedThread?.ban_message.substring(0, 50)}` : global.config_handler.banned_threads.message)
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
        if (global.config_handler.skip.commands.includes(x.config.name)) return message.send(global.config_handler.skip_message || "Command is Unloaded")
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
        x.start({
          event: msg,
          args,
          api: bot,
          message,
          cmd: x?.config?.name,
          usersData: global.usersData,
          threadsData: global.threadsData,
          role: admins.includes(String(msg.from.id)) ? 1 : 0
        });
        const { username, first_name, id } = msg.from;
        logger({ name: username || first_name, command: x.config.name, uid: id, type: msg?.chat?.type || null, event: "initiation" });
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
    let check = await usersData.exists(msg.from.id)
    if (!check) {
      usersData.refresh(msg.from.id, msg)
      global.log(`New User: @${msg.from.username}`, "yellow", true)
      usersData.update(msg.from.id, { authorized: false })
    }
    if (msg.reply_to_message) {
      if (global.bot.reply.has(msg.reply_to_message.message_id)) {
        const replyCTX = global.bot.reply.get(msg.reply_to_message.message_id)
        for (const x of global.cmds.values()) {
          if (x.config.name === replyCTX.cmd) {
            if (typeof x.reply === "function") {
              replied = true;
              const args = msg?.text?.split(" ")
              const { username, first_name, id } = msg.from;
              if (msg.from.bot_id) break;
              const message = create_message(msg, x.config.name);
              await x.reply({
                event: msg,
                args,
                api: bot,
                message,
                cmd: x.config.name,
                Context: replyCTX,
                usersData: global.usersData,
                threadsData: global.threadsData,
                role: admins.includes(String(msg.from.id)) ? 1 : 0
              });
              logger({ name: username || first_name, command: x.config.name, uid: id, type: msg?.chat?.type || null, event: "message_reply" });
              break;
            } else {
              global.log("chat is not a function " + x.config.name, "red")
            }
          }
        }
      }
    }
    if (!replied) {
      for (const x of global.cmds.values()) {
        const args = msg?.text?.split(" ")
        const { username, id, first_name } = msg.from;
        // chat function, Don't need them in events
        if (typeof x.chat === "function") {
          const message = create_message(msg, x.config.name);
          if (msg.from.bot_id) break;
          x.chat({
            event: msg,
            args,
            api: bot,
            message,
            cmd: x.config.name,
            usersData: global.usersData,
            threadsData: global.threadsData,
            role: admins.includes(String(msg.from.id)) ? 1 : 0
          });
          logger({
            name: username || first_name,
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
              usersData: global.usersData,
              threadsData: global.threadsData,
              role: admins.includes(String(from.id)) ? 1 : 0
            });
          }
          const { username, id, first_name } = from;
          logger({ name: username || first_name, command: context.cmd, uid: id, type: ctx?.chat?.type || null, event: eventType });
        }
      }
    }
  } catch (err) { throw err }
};

const handleEvents = async (ctx, eventType) => {
  const { username, id } = ctx?.from;
  if (ctx?.text?.startsWith("/")) return
  try {
    const { message, from } = ctx;
    for (const cmd of global.events.values()) {
      if (
        cmd?.config.name?.toLowerCase() === eventType
      ) {
        const message_function = create_message(ctx);
        if (cmd[eventType]) {
          cmd[eventType]({
            event: ctx,
            api: bot,
            message: message_function,
            cmd: cmd?.config?.name || null,
            usersData: global.usersData,
            threadsData: global.threadsData,
            role: admins.includes(String(from.id)) ? 1 : 0
          });
        }
        // Disable logging for text
        if (eventType === "text" && !global.config.log_event_text) return
        const { username, id, first_name } = from
        logger({ name: username || first_name, command: cmd?.config?.name || null, uid: id, type: ctx?.chat?.type || null, event: eventType, isEvent: true });
      }
    }
  } catch (err) { throw err }
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
  /*
  "audio",
  "document",
  "photo",
  "sticker",
  "video",
  "video_note",
  "voice",
  "contact",
  "location",
  "venue"
  
  Check line 240 - 250
  */
  "text",
  "edited_message",
  "channel_post",
  "edited_channel_post",
  "poll",
  "poll_answer",
  "chat_member",
  "my_chat_member",
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
    if (global.config.event_listener) {
      bot.on(eventType, async (ctx) => handleEvents(ctx, eventType));
    }
  } catch (err) {
    throw err
  }
});

module.exports = bot;