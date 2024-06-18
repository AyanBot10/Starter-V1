const fs = require("fs");
const axios = require("axios");
const path = require("path");
const renamedPath = path.resolve("script", "events");
function fileExists(filename) {
  const filePath = path.join(renamedPath, filename);
  return fs.existsSync(filePath);
}

module.exports = {
  config: {
    name: "event",
    description: "Event Panel",
    role: 1,
    usage: "{pn} load cmd\n{pn} unload event",
    category: "system"
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd);

    try {
      switch (args[0]) {
        case "load":
          if (!args[1]) return message.Syntax(cmd);
          const loadFilename = args[1] + ".js";
          if (!fileExists(loadFilename)) throw new Error("File doesn't exist.");

          const command = require(path.join(renamedPath, loadFilename));
          const commandName = command.config.name;

          if (global.config_handler.skip.events.includes(commandName)) {
            const index = global.config_handler.skip.events.indexOf(commandName);
            global.config_handler.skip.events.splice(index, 1);
            global.utils.configSync({
              skip: {
                ...global.config_handler.skip,
                events: global.config_handler.skip.events
              }
            });
          }
          global.events.set(loadFilename, command);
          message.reply(`Event ${commandName} loaded successfully.`);
          break;

        case "unload":
          if (!args[1]) return message.Syntax(cmd);
          const unloadFilename = args[1] + ".js";
          if (!fileExists(unloadFilename)) throw new Error("File doesn't exist.");

          const commandUnload = require(path.join(renamedPath, unloadFilename));
          const commandNameUnload = commandUnload.config.name;

          if (!global.config_handler.skip.events.includes(commandNameUnload)) {
            global.config_handler.skip.events.push(commandNameUnload);
            global.utils.configSync({
              skip: {
                ...global.config_handler.skip,
                events: global.config_handler.skip.events
              }
            });
          }
          global.events.delete(unloadFilename);
          message.reply(`Unloaded ${commandNameUnload} successfully.`);
          break;

        default:
          return message.Syntax(cmd);
      }
    } catch (err) {
      message.reply(err.message);
    }
  }
};