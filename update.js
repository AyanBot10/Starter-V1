process.emitWarning = function(warning, type) {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};

require("./starter");
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
let log = global.log;

const token = global.config.BOT['token'];
if (!token) {
  log("Include Bot Token", 'red', true);
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
if (!global.cmds) global.cmds = new Map();

try {
  require("./script/command_loader");
} catch (error) {
  log(`Failed to load command loader: ${error.message}`, 'red', true);
  process.exit(1);
}

let commandFiles = [];
try {
  commandFiles = fs.readdirSync("script/commands").filter(file => file.endsWith(".js"));
} catch (error) {
  log(`Failed to read command files: ${error.message}`, 'red', true);
  process.exit(1);
}

const commandsArray = commandFiles.map(file => {
  const command = require(`./script/commands/${file}`);
  if (global.cmds.has(file)) {
    const { name, description } = command.config;
    if (!name) return
    return {
      command: name,
      description: description?.short || description?.long || (typeof description === 'string' ? description : 'Not Available')
    };
  } else {
    log(`Command ${file} is not registered in global.cmds`, 'yellow', false);
    return null;
  }
}).filter(cmd => cmd !== null);

bot.setMyCommands(commandsArray).then(() => {
  log("Updated", "green", true);
  process.exit(0);
}).catch(error => {
  log(`Failed to set bot commands: ${error.message}`, 'red', true);
  process.exit(1);
});