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

const options = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Confirm', callback_data: 'confirm' }, { text: 'Cancel', callback_data: 'cancel' }]
    ]
  }
};

module.exports = {
  config: {
    name: "command",
    aliases: ["cmd"],
    description: "Command Panel",
    role: 1,
    usage: "{pn} load cmd\n{pn} unload cmd\n{pn} install cmd.js cmd_link"
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd);
    try {
      switch (args[0]) {
        case 'load':
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
        case 'unload':
          if (!args[1]) return message.Syntax(cmd);
          const commandUnload = require(path.join(__dirname, args[1]));
          const commandNameUnload = commandUnload.config.name;
          if (!global.config_handler.skip.includes(commandNameUnload)) {
            global.config_handler.skip.push(commandNameUnload);
            global.utils.configSync({ skip: global.config_handler.skip });
          }
          message.reply(`Unloaded ${commandNameUnload} successfully.`);
          break;
        case 'install':
          if (args[1].length > 10) return message.reply("Provide valid and shorter name");
          if (!args[1] || !args[1].endsWith(".js")) return message.reply("Include File name with format");
          if (!args[2] || !args[2].startsWith("http")) return message.reply("Include a valid raw link");
          await message.indicator()
            .then(async () => {
              const sent = await message.reply("Confirm Your Choice", options);
              global.bot.callback_query.set(sent.message_id, {
                cmd,
                author: event.from.id,
                link: args[2],
                file: args[1],
                ctx: sent,
                messageID: sent.message_id,
                chat: event.chat.id
              });
            }).catch(e => { throw e });
          break;
        default:
          message.Syntax(cmd);
          break;
      }
    } catch (err) {
      message.reply(err.message);
    }
  },
  callback_query: async function({ event, message, api, ctx, Context }) {
    try {
      const { link, file } = Context;
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      if (event.reply_to_message.from.id != Context.author) return message.send("Unauthorized")
      console.log(ctx.data)
      switch (ctx.data) {
        case 'confirm': {
          await message.edit("Confirmed", Context.messageID, Context.chat);
          api.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: Context.chat,
            message_id: Context.messageID
          });
          formatsave(file, link).then(() => {
            message.edit(`Downloaded and required ${file} successfully`, Context.messageID, Context.chat);
          });
          break;
        }
        case 'cancel': {
          await message.edit("Cancelled", Context.messageID, Context.chat);
          api.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: Context.chat,
            message_id: Context.messageID
          });
          break;
        }
      }
    } catch (err) {
      message.reply(err.message);
    }
  }
};