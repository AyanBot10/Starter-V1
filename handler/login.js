const log = global.log;

const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs")
const config = global.config;

//const token = process.env["telegram_bot_token"] || config.has["bot_token"] ? config.get("bot_token") : null;
const token = '7170555663:AAHzY7W7Kag_yLCeSAGNNc12XKjYa-ecsgo';

if (!token) {
  return log("Include Bot Token", 'red', true)
  process.exit(3)
}
log("Logging In")
const bot = new TelegramBot(token, { polling: true });
log("Logged In")

module.exports = bot