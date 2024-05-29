module.exports = {
  config: {
    name: 'start',
  },
  execute: (msg, match, bot) => {
    bot.sendMessage(msg.chat.id, 'Hello! I am your bot.');
  }
}
