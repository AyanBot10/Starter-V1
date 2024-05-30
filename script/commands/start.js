module.exports = {
  config: {
    name: 'start',
    description: "Initiates the Bot"
  },
  run: ({ event, api }) => {
    const text = `<a href="tg://bot_command?command=/help">/help</a>`;
    const message = `Hello, please use the ${text} command to get a list of all available commands`;
    api.sendMessage(event.chat.id, message, { parse_mode: 'HTML' });
  }
}