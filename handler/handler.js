const bot = require("./login.js");
const logger = require("../logger/usage.js");



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
      (x.config.aliases &&
        x.config.aliases.some(
          alias => alias.toLowerCase() === command.toLowerCase()
        ))
    ) {
      const admin = process.env['ADMIN'];

      if ((x.config?.role && x.config?.role > 0) && admin != msg.from.id) {
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
      logger(username, x.config.name, id, groupId, true);

      break;
    }
  }

  if (!commandFound) {
    await bot.sendMessage(msg.chat.id, "Say what? come again");
  }
});

bot.on("message", async msg => {
  const { username, id } = msg.from;
  const groupId =
    msg.chat?.type === "group" || msg.chat?.type === "supergroup" ?
    msg.chat.id :
    null;

  if (process.env["CONNECT_DB"] == "true" && global.update) {
    await global.update(msg);
  }

  if (process.env["LOGGER"] != "false") {
    if (msg?.text.startsWith("/")) return;
    logger(username, msg.text.substring(0, 100), id, groupId, false);
  }
});

bot.on("callback_query", async ctx => {
  const { message, data, from } = ctx;

  if (global.bot.callback.has(message.message_id)) {
    // New Method
    let context = global.bot.callback.get(message.message_id);
    const cmd = Array.from(global.cmds.values()).find(
      cmd => cmd.config.name == context.cmd
    );

    if (cmd) {
      await cmd.callback({
        event: message,
        api: bot,
        ctx,
        Context: context
      });
    }
    const { username, id } = from;
    const groupId =
      message?.chat?.type === "group" ||
      message?.chat?.type === "supergroup" ?
      message.chat.id :
      null;
    logger(username, context.cmd, id, groupId, true);
  }
});

module.exports = bot;