/***
 * This is the most basic telegram bot template there is, Don't expect much
 */

console.log("Basic Bot V1.0.1");

const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("config.json", 'utf-8'));
global.cmds = new Map();
require("./script/command.js")
const token = process.env["telegram_bot_token"] || config["bot_token"];
if (!token) {
  return console.log("Include Bot Token")
}
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

bot.on('message', (msg) => {
  if (config.log_level.messages) {
    console.log(msg)
  }
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

console.log("Logged In")