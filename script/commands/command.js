const fs = require("fs");
const axios = require("axios");
const path = require('path');

function fileExists(filename) {
  const filePath = path.join(__dirname, filename);
  return fs.existsSync(filePath);
}

module.exports = {
  config: {
    name: "command",
    aliases: ["cmd"],
    description: "Command Panel",
    role: 1,
    usage: "{pn} load cmd\n{pn} unload cmd"
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd);
    try {
      switch (args[0]) {
        case 'load': {
          if (!args[1]) return message.Syntax(cmd);
          if (!fileExists(args[1] + ".js")) throw new Error("File doesn't exist.");

          const command = require(path.join(__dirname, args[1] + ".js"));
          const commandName = command.config.name;

          if (global.config_handler.skip.includes(commandName)) {
            const index = global.config_handler.skip.indexOf(commandName);
            global.config_handler.skip.splice(index, 1);
            global.utils.configSync({ skip: global.config_handler.skip });
          }

          global.cmds.set(commandName, command);
          message.reply(`Command ${commandName} loaded successfully.`);
          break;
        }
        case 'unload': {
          if (!args[1]) return message.Syntax(cmd);

          const command = require(path.join(__dirname, args[1]));
          const commandName = command.config.name;

          if (!global.config_handler.skip.includes(commandName)) {
            global.config_handler.skip.push(commandName);
            global.utils.configSync({ skip: global.config_handler.skip });
          }
          message.reply(`Unloaded ${commandName} successfully.`);
          break;
        }
        default:
          message.Syntax(cmd);
          break;
      }
    } catch (err) {
      message.reply(err.message);
    }
  }
}