const bot = require("./login.js");

bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];
  const args = msg.text.split(" ").slice(1);
  for (let [value, x] of Object.entries(global.cmds)) {
    if (x.config.name == command) {
      x.start({ event: msg, args, api: bot });
      break;
    }
  }
});

bot.on('message', async (msg) => {
  if (global.database_connection) await global.update(msg);
});

bot.on('callback_query', (ctx) => {
  let { message, data } = ctx;
  let match = data.match(/\/(\w+)/);

  if (match && match[1]) {
    let command = match[1];
    // To-do: const args = msg.text.split(" ").slice(1);
    for (let x of Object.values(global.cmds)) {
      if (x.config.name === command) {
        x.callback({ event: message, api: bot, ctx });
        break;
      }
    }
  }
});

module.exports = bot;