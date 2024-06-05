const fs = require("fs");
const axios = require("axios");
const path = require('path');
const prettier = require('prettier');

function fileExists(filename) {
  const filePath = path.join(__dirname, filename);
  return fs.existsSync(filePath);
}

async function formatsave(filename, link) {
  try {
    const response = await axios.get(link);
    let jsCode = response.data;
    jsCode = await prettier.format(jsCode, { parser: 'babel', semi: true, singleQuote: true });
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, jsCode, 'utf8');
    const requiredCode = require(filePath);
    global.cmds.set(filename, requiredCode);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: { name: "command", aliases: ["cmd"], description: "Command Panel", role: 1, usage: "{pn} load cmd\n{pn} unload cmd\n{pn} install cmd.js cmd_link" },
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
        case 'install': {
          if (args[1].length > 10) return message.reply("Provide valid and shorter name")
          if (!args[1] || !args[1].endsWith(".js")) return message.reply("Include File name with format")
          if (!args[2] || !args[2].startsWith("http")) return message.reply("Include a valid raw link")
          await message.indicator()
          formatsave(args[1], args[2])
            .then(x => {
              message.reply("File saved and loaded successfully")
            }).catch(e => { throw e })
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