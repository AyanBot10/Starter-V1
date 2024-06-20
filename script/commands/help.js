module.exports = {
  config: {
    name: "help",
    description: {
      short: "Provides a list of all available commands",
      long: "Provides a detailed list of all available commands"
    },
    usage: "{pn} - Logs all commands\n" +
      "{pn} <cmd> - Logs the command's info",
    category: "utility"
  },
  start: async function({ api, event, args, message, looking }) {
    if (args[0]) {
      let command = args[0];
      let commandFound = false;

      for (const x of global.cmds.values()) {
        if (
          x.config.name?.toLowerCase() === command?.toLowerCase() ||
          (x.config.aliases &&
            x.config.aliases.some(alias => alias.toLowerCase() === command.toLowerCase()))
        ) {
          commandFound = true;
          let messageContent = "─── NAME ────⭓\n";
          messageContent += `» ${x.config?.name}\n`;

          messageContent += "─── INFO ────⭓\n";
          const { description } = x.config;
          const descText =
            description?.long ||
            description?.short ||
            (typeof description === "string" ? description : "N/A");
          messageContent += `» Description: ${descText}\n`;
          if (x.config.author) {
            messageContent += `» Author: ${x.config.author}\n`;
          }
          const credits = x.config.credits || x.config.credit;
          if (credits) {
            messageContent += `» Credit: ${credits}\n`;
          }
          if (x.config.cooldown) {
            messageContent += `» Cooldown: ${x.config.cooldown}s\n`;
          }
          let role_config = x.config?.role || 0;
          if (role_config === 0) role_config = "0 (everyone)"
          if (role_config === 1) role_config = "1 (admin)"
          messageContent += `» Role: ${role_config}\n`;
          if (x.config.aliases && x.config.aliases.some(alias => alias.toLowerCase() === command.toLowerCase())) {
            messageContent += `» Aliases: ${x.config?.aliases?.join(" ")}\n`;
          }

          function regexStr(str, name) {
            const regex = /{pn}/g;
            return regex.test(str) ? str.replace(regex, `/${name}`) : str;
          }

          if (x.config.usage) {
            messageContent += "─── USAGE ────⭓\n"
            messageContent += `${regexStr(x.config?.usage || "N/A", x.config.name)}\n`;
          }

          if (x.config.category) {
            messageContent += "─── GENRE ────⭓\n"
            messageContent += `${(x.config?.category || "Uncategorized").toUpperCase()}\n`;
          }

          messageContent += "───────⭔";
          if (looking?.message_id) {
            await api.editMessageText(messageContent, { chat_id: event.chat.id, message_id: looking.message_id })
          } else {
            message.reply(messageContent)
          }
          break;
        }
      }

      if (!commandFound) {
        return await api.sendMessage(event.chat.id, `No such command as '${args[0]}'`);
      }
    } else {
      let responseText = "";
      const categories = {};
      global.cmds.forEach((commandConfig) => {
        const { name, description } = commandConfig.config;
        let { category } = commandConfig.config;
        if (category) category = category.trim();
        const descText =
          description?.short ||
          description?.long ||
          (typeof description === "string" ? description : "N/A");
        const categoryName = category?.toLowerCase() || "uncategorized";
        if (!categories[categoryName]) {
          categories[categoryName] = [];
        }
        categories[categoryName].push(name.toLowerCase());
      });
      const sortedCategories = Object.keys(categories).sort();
      sortedCategories.forEach((category) => {
        categories[category].sort();
        responseText += `╭──『 ${category} 』\n`;
        categories[category].forEach((command) => {
          responseText += `✧${command} `;
        });
        responseText += `\n╰───────────◊\n`;
      });
      message.reply(`<pre><b>${responseText}</b></pre>`, { parse_mode: "HTML" });
    }
  },
  callback_query: async function({ event, api, ctx, Context, message }) {
    const command = ctx.data;
    await api.answerCallbackQuery({ callback_query_id: ctx.id });
    const lookUp = await message.edit("Looking up 🔎", ctx.message.message_id, event.chat.id, { reply_markup: { inline_keyboard: [] } })

    return await this.start({ api, event, args: [command], looking: lookUp })
  }
};