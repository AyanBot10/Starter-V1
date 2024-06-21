const fs = require("fs");
const axios = require("axios");
const path = require("path");
const prettier = require("prettier");

function fileExists(filename) {
  const filePath = path.join(__dirname, filename);
  return fs.existsSync(filePath);
}

async function formatsave(filename, link) {
  try {
    global.cmds.delete(filename);
    const response = await axios.get(link);
    let jsCode = response.data;
    jsCode = await prettier.format(jsCode, { parser: "babel", semi: true, singleQuote: true });
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, jsCode, "utf8");
    const requiredCode = require(filePath);
    if (!requiredCode.start) throw new Error("File Doesn't have start function set");
    global.cmds.set(filename, requiredCode);
  } catch (error) {
    throw error;
  }
}

async function saveString(filename, jsCode) {
  jsCode = jsCode.split(" ").slice(2).join(" ");
  jsCode = await prettier.format(jsCode, { parser: "babel", semi: true, singleQuote: true });
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, jsCode, "utf8");
  const requiredCode = require(filePath);
  global.cmds.set(filename, requiredCode);
}

module.exports = {
  config: {
    name: "command",
    aliases: ["cmd"],
    description: "Command Panel",
    role: 1,
    usage: "{pn} load cmd\n{pn} unload cmd\n{pn} install cmd.js cmd_link",
    category: "system"
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd);
    try {
      switch (args[0]) {
        case "load":
          if (!args[1]) return message.Syntax(cmd);
          if (!fileExists(args[1] + ".js")) throw new Error("File doesn't exist.");
          const command = require(path.join(__dirname, args[1] + ".js"));
          const commandName = command.config.name;
          if (global.config_handler.skip.commands.includes(commandName)) {
            const index = global.config_handler.skip.commands.indexOf(commandName);
            global.config_handler.skip.commands.splice(index, 1);
            global.utils.configSync({
              skip: {
                ...global.config_handler.skip,
                commands: global.config_handler.skip.commands
              }
            });
          }
          global.cmds.set(args[1] + ".js", command);
          message.reply(`Command ${commandName} loaded successfully.`);
          break;
        case "unload":
          if (!args[1]) return message.Syntax(cmd);
          if (!args[1]?.endsWith(".js")) return message.reply("File name must end with .js")
          const commandUnload = require(path.join(__dirname, args[1]));
          const commandNameUnload = commandUnload.config.name;
          if (!global.config_handler.skip.commands.includes(commandNameUnload)) {
            global.config_handler.skip.commands.push(commandNameUnload);
            global.utils.configSync({
              skip: {
                ...global.config_handler.skip,
                commands: global.config_handler.skip.commands
              }
            });
          }
          message.reply(`Unloaded ${commandNameUnload} successfully.`);
          global.cmds.delete(args[1]);
          break;
        case "install":
          if (!args[1] || !args[1].endsWith(".js")) return message.reply("Include File name with format");
          if (!args[2]) return message.reply("Include a valid raw link");
          await message
            .indicator()
            .then(async () => {
              const sent = await message.reply(!fileExists(args[1]) ? `${args[1]} Already Exists` : "Confirm Your Choice", {
                reply_markup: {
                  inline_keyboard: [[{ text: "Confirm", callback_data: "confirm" }, { text: "Cancel", callback_data: "cancel" }]]
                }
              });
              global.bot.callback_query.set(sent.message_id, {
                cmd,
                author: event.from.id,
                link: args[2]?.startsWith("http") ? args[2] : event.text,
                isText: args[2].startsWith("http"),
                file: args[1],
                ctx: sent,
                messageID: sent.message_id,
                chat: event.chat.id
              });
            })
            .catch((e) => {
              throw e;
            });
          break;
        default:
          message.Syntax(cmd);
          break;
      }
    } catch (err) {
      message.reply(err.message);
    }
  },
  callback_query: async function({ event, message, api, ctx, Context, cmd }) {
    try {
      const { link, file, author, messageID, chat, isText } = Context;
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      if (author != ctx.from.id) return message.send("Unauthorized");
      const { data } = ctx;
      switch (data) {
        case "confirm":
          await message.edit("Confirmed", messageID, chat, {
            reply_markup: { inline_keyboard: [] }
          });
          /*if (isText) {
                      await formatsave(file, link);
                    } else {
                      await saveString(file, link.slice(link.indexOf(".js") + 3));
                    }
                    */
          await formatsave(file, link);

          // Text parsing in telegram sucks, you can't install commands in chat, Template Literals won't work
          message.edit(`Downloaded and acquired ${file} successfully, Restart recommended`, messageID, chat);
          break;
        case "cancel":
          await message.edit("Cancelled", messageID, chat, {
            reply_markup: { inline_keyboard: [] }
          });
          break;
        default:
          message.Syntax(cmd);
      }
    } catch (err) {
      console.log(err)
      message.reply(err.message);
    }
  }
};