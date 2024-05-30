/***
 * This is the most basic telegram bot template there is, Don't expect much
 */

console.log("Basic Bot V1.1.1");
require("./global.js")();
require("./accountant.js")();
const log = require("./logger/chalk.js")
global.log = log;
// text, color, bold bool
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("config.json", 'utf-8'));
require("./script/command.js")
const token = process.env["telegram_bot_token"] || config["bot_token"];
if (!token) {
  return log("Include Bot Token", 'red', true)
}


const userModel = require("./Database/user.js")
const DB = require("./Database/DB.js")
const update = require("./Database/updateDB.js")


const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];
  for (let [value, x] of Object.entries(global.cmds)) {
    if (x.config.name == command) {
      x.start({ event: msg, args: match, api: bot });
      break;
    }
  }
});

bot.on('message', async (msg) => {
  await update(msg);
});

bot.on('callback_query', (ctx) => {
  let { message, data } = ctx;
  let match = data.match(/\/(\w+)/);

  if (match && match[1]) {
    let command = match[1];

    for (let x of Object.values(global.cmds)) {
      if (x.config.name === command) {
        x.callback({ event: message, args: match, api: bot, ctx });
        break;
      }
    }
  }
});


async function connectDB() {
  try {
    await DB()
  } catch (err) {
    log("Failed to Connect to Database " + err, "red", true)
    process.exit(1)
  }
}
connectDB().then(() => {
  log("Logged In", "lime", true)
})