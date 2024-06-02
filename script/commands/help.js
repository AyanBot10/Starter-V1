module.exports = {
  config: {
    name: "help",
    description: {
      short: "Provides a list of all available commands",
      long: "Provides a detailed list of all available commands"
    },
    usage: "{pn} - Logs all commands\n" +
      "{pn} <cmd> - Logs the command's info"
  },
  start: async ({ api, event, args }) => {
    if (args[0]) {
      let command = args[0];
      let commandFound = false;

      for (const x of global.cmds.values()) {
        if (
          x.config.name?.toLowerCase() === command?.toLowerCase() ||
          (x.config.aliases &&
            x.config.aliases.some(alias => alias.toLowerCase() === command.toLowerCase()))
        ) {
          // messageContent design inspired by samir's annie bot
          commandFound = true;
          let messageContent = "─── NAME ────⭓\n\n";
          messageContent += `» ${x.config?.name}\n`;

          messageContent += "─── INFO ────⭓\n\n";
          const { description } = x.config;
          const descText =
            description?.short ||
            description?.long ||
            (typeof description === "string" ? description : "N/A");
          messageContent += `» Description: ${descText}\n`;
          if (x.config.author) {
            messageContent += `» Author: ${x.config.author}\n`;
          }
          messageContent += `» Role: ${x.config?.role || 0}\n`;
          if (x.config.aliases && x.config.aliases.some(alias => alias.toLowerCase() === command.toLowerCase())) {
            messageContent += `» Aliases: ${x.config?.aliases?.join(" ")}\n`;
          }

          function regexStr(str, name) {
            const regex = /{pn}/g;
            return regex.test(str) ? str.replace(regex, `/${name}`) : str;
          }

          if (x.config.usage) {
            messageContent += "─── USAGE ────⭓\n\n";
            messageContent += `» ${regexStr(x.config?.usage || "N/A", x.config.name)}\n`;
          }

          messageContent += "───────⭔";

          await api.sendMessage(event.chat.id, messageContent);
          break;
        }
      }

      if (!commandFound) {
        return await api.sendMessage(event.chat.id, `No such command as '${args[0]}'`);
      }
    } else {
      let responseText = "";

      global.cmds.forEach((commandConfig, commandName) => {
        const { name, description } = commandConfig.config;
        const descText =
          description?.short ||
          description?.long ||
          (typeof description === "string" ? description : "N/A");
        responseText += `${name.toUpperCase()} -- <b>${descText}</b>\n\n`;
      });

      api.sendMessage(event.chat.id, responseText, {
        parse_mode: "HTML"
      });
    }
  }
};