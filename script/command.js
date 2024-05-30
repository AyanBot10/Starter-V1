const path = require("path");
const { readdirSync } = require("fs");
global.cmds = new Map();
const commandsPath = path.join(__dirname, "commands");
const files = readdirSync(commandsPath);

for (let file of files) {
  if (file.endsWith(".js")) {
    const command = require(path.join(commandsPath, file));
    global.cmds[file] = command;
  }
}

module.exports = null;