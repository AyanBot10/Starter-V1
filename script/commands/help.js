module.exports = {
  config: {
    name: 'help',
    description: {
      short: "Provides a list of all available commands",
      long: "Provides a detailed list of all available commands"
    }
  },
  start: async ({ api, event, args }) => {
    if (args[0]) {
      let command = args[0];
      let commandFound = false;
      for (const x of global.cmds.values()) {
        if (x.config.name?.toLowerCase() === command?.toLowerCase() || (x.config.aliases && x.config.aliases.some(alias => alias.toLowerCase() === command.toLowerCase()))) {
          commandFound = true;
          let messageContent = `Command: ${x.config?.name}\n`;
          messageContent += x.config?.author ? `Author: ${x.config.author}\n` : '';
          if (x.config.aliases && x.config.aliases.some(alias => alias.toLowerCase() === command.toLowerCase())) {
            messageContent += `Aliases: ${x.config?.aliases?.join(' ,')}\n`
          }
          messageContent += `Description: ${x.config.description?.short || x.config.description?.long}\n`;
          messageContent += `Usage: ${x.config.usage || "N/A"}`;
          await api.sendMessage(event.chat.id, messageContent);
          break;
        }
      }
      if (!commandFound) {
        return await api.sendMessage(event.chat.id, `No such command as '${args[0]}'`);
      }
    } else {
      let responseText = '';

      global.cmds.forEach((commandConfig, commandName) => {
        const { name, description } = commandConfig.config;
        const descText = description?.short || description?.long || (typeof description === 'string' ? description : 'N/A');
        responseText += `${name.toUpperCase()} -- <b>${descText}</b>\n\n`;
      });

      api.sendMessage(event.chat.id, responseText);
    }
  },
  callback: async function({ event, api, ctx }) {
    try {
      let responseText = '';

      global.cmds.forEach((commandConfig, commandName) => {
        const { name, description } = commandConfig.config;
        const descText = description?.short || description?.long || (typeof description === 'string' ? description : 'N/A');
        responseText += `${name.toUpperCase()} -- <b>${descText}</b>\n\n`;
      });

      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      await api.sendMessage(event.chat.id, responseText, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error handling callback:', error);
      await api.sendMessage(event.chat.id, 'There was an error processing your request.');
    }
  }
};