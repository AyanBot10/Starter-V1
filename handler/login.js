const log = global.log;

const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs")
const config = global.config;

const token = process.env["telegram_bot_token"] || config.has["bot_token"] ? config.get("bot_token") : null;
if (!token) {
  return log("Include Bot Token", 'red', true)
}
log("Logging In")
const bot = new TelegramBot(token, { polling: true });
log("Logged In")

module.exports = bot