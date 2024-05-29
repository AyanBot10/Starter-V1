module.exports = {
  config: {
    name: 'help',
  },
  execute: (msg, match, bot) => {
    let help = Object.keys(global.cmds);
    let text = 'Available Commands:\n';
    for (let content of help) {
      text += `${global.cmds[content].config.name}\n`;
    }
    bot.sendMessage(msg.chat.id, text);
  }
}
