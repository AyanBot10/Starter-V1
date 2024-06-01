const bot = require("./login.js");
const logger = require("../logger/usage.js");

bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];
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
      commandFound = true;
      await x.start({ event: msg, args, api: bot });

      const { username, id } = msg.from;
      const groupId =
        msg.chat?.type === "group" || msg.chat?.type === "supergroup" ?
        msg.chat.id :
        null;
      logger(username, x.config.name, id, groupId);

      break;
    }
  }

  if (!commandFound) {
    const helpButton = {
      text: "/help",
      callback_data: "/help"
    };
    const message =
      "Hello, please use the button below to receive a list of all available commands.";
    const options = {
      reply_markup: {
        inline_keyboard: [[helpButton]]
      }
    };

    bot.sendMessage(msg.chat.id, message, options);
  }
});

bot.on("message", async msg => {
  const { username, id } = msg.from;
  const groupId =
    msg.chat?.type === "group" || msg.chat?.type === "supergroup" ?
    msg.chat.id :
    null;

  if (process.env["CONNECT_DB"] === "true" && global.update) {
    await global.update(msg);
  }

  if (process.env["LOGGER"] === "true") {
    if (msg?.text.startsWith("/")) return;
    logger(username, msg.text.substring(0, 100), id, groupId);
  }
});

bot.on("callback_query", async ctx => {
  const { message, data, from } = ctx;
  const match = data.match(/\/(\w+)/);
  const args = message?.text?.split(" ");
  if (global.bot.callback.has(message.message_id)) {
    // New Method
    let context = global.bot.callback.get(message.message_id);
    const cmd = Array.from(global.cmds.values()).find(
      cmd => cmd.config.name == context.cmd
    );

    if (cmd) {
      cmd.callback({ event: message, api: bot, ctx, args, Callback: context });
    }
  } else {
    // Old Method
    if (match) {
      const command = match[1];
      for (const x of global.cmds.values()) {
        if (
          x.config.name?.toLowerCase() === command?.toLowerCase() ||
          (x.config.aliases &&
            x.config.aliases.some(
              alias => alias.toLowerCase() === command.toLowerCase()
            ))
        ) {
          await x.callback({ event: message, args, api: bot, ctx });
        }

        const { username, id } = from;
        const groupId =
          message?.chat?.type === "group" ||
          message?.chat?.type === "supergroup" ?
          message.chat.id :
          null;
        logger(username, command, id, groupId);

        break;
      }
    }
  }
});

module.exports = bot;