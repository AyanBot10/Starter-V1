module.exports = {
  config: {
    name: "help",
    description: {
      short: "Provides a list of all available commands",
      long: "Provides a detailed list of all available commands"
    },
    usage: "{pn} - Logs all commands\n{pn} <cmd> - Logs the command's info",
    category: "utility"
  },
  start: async function({ api, event, args, message, looking }) {
    if (args[0]) {
      let command = args[0].toLowerCase();
      let commandFound = false;

      for (const cmd of global.cmds.values()) {
        if (global.config_handler.skip.commands.includes(cmd.config.name))
          continue
        if (cmd.config.name.toLowerCase() === command ||
          (cmd.config.aliases && cmd.config.aliases.some(alias => alias.toLowerCase() === command))) {
          commandFound = true;
          let messageContent = `─── NAME ────⭓\n» ${cmd.config.name}\n`;
          const { description } = cmd.config;
          const descText = description?.long || description?.short || "N/A";
          messageContent += `─── INFO ────⭓\n» Description: ${descText}\n`;

          if (cmd.config.author) {
            messageContent += `» Author: ${cmd.config.author}\n`;
          }

          const credits = cmd.config.credits || cmd.config.credit;
          if (credits) {
            messageContent += `» Credit: ${credits}\n`;
          }

          if (cmd.config.cooldown) {
            messageContent += `» Cooldown: ${cmd.config.cooldown}s\n`;
          }

          let role = cmd.config.role || 0;
          role = role === 0 ? "0 (everyone)" : role === 1 ? "1 (admin)" : role;
          messageContent += `» Role: ${role}\n`;

          if (cmd.config.aliases) {
            messageContent += `» Aliases: ${cmd.config.aliases.join(", ")}\n`;
          }

          const replacePlaceholder = (str, name) => str.replace(/{pn}/g, `/${name}`);

          if (cmd.config.usage) {
            messageContent += `─── USAGE ────⭓\n${replacePlaceholder(cmd.config.usage, cmd.config.name)}\n`;
          }

          if (cmd.config.category) {
            messageContent += `─── GENRE ────⭓\n${cmd.config.category.toUpperCase()}\n`;
          }

          messageContent += "───────⭔";

          if (looking?.message_id) {
            await api.editMessageText(messageContent, { chat_id: event.chat.id, message_id: looking.message_id });
          } else {
            message.reply(messageContent);
          }
          break;
        }
      }

      if (!commandFound) {
        await api.sendMessage(event.chat.id, `No such command as '${args[0]}'`);
      }
    } else {
      let responseText = "";
      const categories = {};

      global.cmds.forEach((cmd) => {
        const { name, description, category } = cmd.config;
        if (global.config_handler.skip.commands.includes(name)) return;
        const descText = description?.short || description?.long || "N/A";
        const categoryName = (category || "Uncategorized").trim().toLowerCase();

        if (!categories[categoryName]) {
          categories[categoryName] = [];
        }
        categories[categoryName].push(name.toLowerCase());
      });

      const sortedCategories = Object.keys(categories).sort();
      sortedCategories.forEach((category) => {
        responseText += `╭──『 ${category} 』\n`;
        categories[category].sort().forEach((command) => {
          responseText += `✧${command} `;
        });
        responseText += `\n╰───────────◊\n`;
      });

      message.reply(`<pre><b>${responseText}</b></pre>`, { parse_mode: "HTML" });
    }
  },
  callback_query: async function({ event, api, ctx, message }) {
    const command = ctx.data;
    await api.answerCallbackQuery(ctx.id, { text: "Wait While I Look Through My system" });
    const lookUp = await message.edit("Looking up 🔎", ctx.message.message_id, event.chat.id, { reply_markup: { inline_keyboard: [] } });
    await this.start({ api, event, args: [command], looking: lookUp });
  }
};