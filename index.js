/***
 * This is the most basic telegram bot template there is, Don't expect much
 */

console.log("Basic Bot V1.0.1");
require("global.js")();
require("./accountant.js")();
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("config.json", 'utf-8'));
require("./script/command.js")
const token = process.env["telegram_bot_token"] || config["bot_token"];
if (!token) {
  return console.log("Include Bot Token")
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
    console.error("Failed to Connect to Database", err)
  }
}
connectDB().then(() => {
  console.log("Logged In")
})