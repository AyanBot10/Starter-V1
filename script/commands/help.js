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
    let responseText = 'Available Commands:\n';

    commandList.forEach(command => {
      const { name, description } = global.cmds[command].config;
      const descText = description?.short || description?.long || (typeof description === 'string' ? description : 'No description available');
      responseText += `${name} -- *${descText}*\n`;
    });

    api.sendMessage(event.chat.id, responseText);
  },
  callback: async function({ event, api, ctx }) {
    const commandList = Object.keys(global.cmds);
    let responseText = '';

    commandList.forEach(command => {
      const { name, description } = global.cmds[command].config;
      const descText = description?.short || description?.long || (typeof description === 'string' ? description : 'No description available');
      responseText += `${name} -- <b>${descText}</b>\n`;
    });

    api.sendMessage(event.chat.id, responseText, { parse_mode: 'HTML' });
    await api.answerCallbackQuery(ctx.id);
  }
};