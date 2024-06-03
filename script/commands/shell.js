const { exec } = require('child_process');
const { tmp, uuid, module: { path } } = global;
const fs = require("fs");

module.exports = {
  config: {
    name: "shell",
    aliases: ["sh"],
    role: 1,
    description: "Quick Terminal Access",
    usage: "{pn} <code>"
  },
  start: async function({ message, args, event, api }) {
    if (!args[0]) return message.Syntax()
    exec(args.join(" "), (error, stdout, stderr) => {
      if (error) {
        message.reply(`<pre><b>${error.message}</b></pre>`, { parse_mode: "HTML" });
      } else {
        if (stdout.length > 1500) {
          const file = path.join(tmp, `${uuid()}.txt`)
          fs.writeFileSync(file, stdout);
          message.reply("STDout Output", {
            document: fs.createReadStream(file)
          }).then(() => fs.unlinkSync(file))
        } else {
          message.reply(stdout);
        }
      }
    });
  }
}