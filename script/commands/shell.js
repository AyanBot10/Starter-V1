const { exec } = require('child_process');
config = {
  name: "shell",
  aliases: ["sh"],
  role: 1,
  description: "Quick Terminal Access",
  usage: "{pn} <code>"
}
async function start({ message, args, event, api }) {
  if (!args[0]) return message.Syntax()
  exec(args.join(" "), (error, stdout, stderr) => {
    if (error) {
      message.reply(`<b><font color="red">${error.message}</font></b>`, { parse_mode: "HTML" });
    } else {
      message.reply(stdout);
    }
  });
}

module.exports = { config, start }