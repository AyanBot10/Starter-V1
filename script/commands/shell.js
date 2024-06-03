const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const tmp_dir = path.join(__dirname, 'tmp');
const hazard = path.join(__dirname, 'assets', 'hazard.jpeg')
module.exports = {
  config: {
    name: "shell",
    aliases: ["sh"],
    role: 1,
    description: "Quick Terminal Access",
    usage: "{pn} <code>"
  },
  start: async function({ message, args, event, api }) {
    if (!args[0]) return message.Syntax(this.config.name);
    exec(args.join(" "), async (error, stdout, stderr) => {
      if (error) {
        message.reply(`<pre><b>${error.message}</b></pre>`, { parse_mode: "HTML" });
      } else {
        if (stdout.length > 1500) {
          const filename = uuidv4();
          const file = path.join(tmp_dir, `${filename}.txt`);
          fs.writeFileSync(file, stdout);
          api.sendDocument(event.chat.id, file, {
            caption: "SDTout Output",
            filename: 'SDTout Error.txt',
            thumb: {
              source: fs.createReadStream(hazard)
            }
          }).then(() => {
            fs.unlinkSync(file);
          }).catch(err => {
            console.error("Error sending document:", err);
            fs.unlinkSync(file);
          });
        } else {
          message.reply(stdout);
        }
      }
    });
  }
};