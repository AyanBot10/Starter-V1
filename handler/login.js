const log = global.log;

const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs")

const token = global.config.BOT['BOT_TOKEN'];

if (!token) {
  return log("Include Bot Token", 'red', true)
  process.exit(3)
}
log("Logging In")
const bot = new TelegramBot(token, { polling: global.config.BOT.polling || true });
log("Logged In")

module.exports = bot