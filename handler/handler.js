const bot = require("./login.js");

bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];
  const args = msg.text.split(" ").slice(1);

  for (const x of global.cmds.values()) {
    if (x.config.name == command) {
      await x.start({ event: msg, args, api: bot });
      break;
    }
  }
});

bot.on('message', async (msg) => {
  if (process.env['LOG_LEVEL_MESSAGES']) log(msg.text)
  if (global.database_connection) await global.update(msg);
});

bot.on('callback_query', async (ctx) => {
  const { message, data } = ctx;
  const match = data.match(/\/(\w+)/);
  const args = message?.text?.split(" ")?.slice(1);
  if (match) {
    const command = match[1];
    for (const x of global.cmds.values()) {
      if (x.config.name == command) {
        await x.callback({ event: message, args, api: bot, ctx });
        break;
      }
    }
  }
});

module.exports = bot;