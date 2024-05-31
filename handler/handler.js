const bot = require("./login.js");

bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];
  const args = msg.text.split(" ").slice(1);
  let commandFound = false;
  for (const x of global.cmds.values()) {
    if (x.config.name?.toLowerCase() === command?.toLowerCase() || (x.config.aliases && x.config.aliases.some(alias => alias.toLowerCase() === command.toLowerCase()))) {
      commandFound = true;
      await x.start({ event: msg, args, api: bot });
      break;
    }
  }
  if (!commandFound) {
    const helpButton = {
      text: '/help',
      callback_data: '/help'
    };
    const message = 'Hello, please use the button below to receive a list of all available commands.';
    const options = {
      reply_markup: {
        inline_keyboard: [[helpButton]]
      }
    };

    bot.sendMessage(msg.chat.id, message, options);
  }
});

/*
bot.on('message', async (msg) => {
  if (process.env["CONNECT_DB"]) await global.update(msg);
});
*/

bot.on('callback_query', async (ctx) => {
  const { message, data } = ctx;
  const match = data.match(/\/(\w+)/);
  const args = message?.text?.split(" ");
  if (match) {
    const command = match[1];
    for (const x of global.cmds.values()) {
      if (x.config.name === command) {
        await x.callback({ event: message, args, api: bot, ctx });
        break;
      }
    }
  }
});

module.exports = bot;