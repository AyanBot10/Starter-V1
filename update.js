process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};

const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const log = require("./logger/chalk.js")
global.log = log;

require('dotenv').config();

const token = process.env['BOT_TOKEN'];
if (!token) {
  log("Include Bot Token", 'red', true)
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
if (!global.cmds) global.cmds = new Map();
require("./script/command.js")();
const commandList = Object.keys(global.cmds);

const array = commandList.map(command => {
  const { name, description } = global.cmds[command].config;
  return {
    command: name,
    description: description?.short || description?.long || (typeof description === 'string' ? description : 'N/A')
  };
});

bot.setMyCommands(array).then(() => {
  log("Updated", "green", false);
  log("Exiting Process", "green", true)
  process.exit(3)
})