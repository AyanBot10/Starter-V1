module.exports = {
  config: {
    name: 'help',
    description: {
      short: "Provides a list of all available commands",
      long: "Provides a detailed list of all available commands"
    }
  },
  run: ({ api, event }) => {
    const commandList = Object.keys(global.cmds);
    let responseText = 'Available Commands:\n';

    commandList.forEach(command => {
      const { name, description } = global.cmds[command].config;
      responseText += `${name} -- *${description?.short || description?.long || description }*\n`;
    });

    api.sendMessage(event.chat.id, responseText);
  }
}