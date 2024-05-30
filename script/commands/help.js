module.exports = {
  config: {
    name: 'help',
    description: {
      short: "Provides a list of all available commands",
      long: "Provides a detailed list of all available commands"
    }
  },
  start: ({ api, event }) => {
    const commandList = Object.keys(global.cmds);
    let responseText = '';

    commandList.forEach(command => {
      const { name, description } = global.cmds[command].config;
      const descText = description?.short || description?.long || (typeof description === 'string' ? description : 'N/A');
      responseText += `<a href="tg://bot_command?command=${name}">${name}</a> -- <b>${descText}</b>\n`;
    });

    api.sendMessage(event.chat.id, responseText, { parse_mode: 'HTML' });
  },
  callback: async function({ event, api, ctx }) {
    try {
      const commandList = Object.keys(global.cmds);
      let responseText = '';

      commandList.forEach(command => {
        const { name, description } = global.cmds[command].config;
        const descText = description?.short || description?.long || (typeof description === 'string' ? description : 'N/A');
        responseText += `<a href="tg://bot_command?command=${name}">${name}</a> -- <b>${descText}</b>\n`;
      });

      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      await api.sendMessage(event.chat.id, responseText, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error handling callback:', error);
      await api.sendMessage(event.chat.id, 'There was an error processing your request.');
    }
  }
};