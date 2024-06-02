const path = require("path");
const { readdirSync } = require("fs");

global.log("Binding Commands...", "yellow", false);
let errors = 0;
let loaded = 0;
let names = [];
global.cmds = new Map();
const commandsPath = path.join(__dirname, "commands");
const files = readdirSync(commandsPath);

for (let file of files) {
  if (global.config?.handler?.skip.includes(file)) continue;
  if (file.endsWith(".js")) {
    try {
      const command = require(path.join(commandsPath, file));
      global.cmds.set(file, command);
      loaded++;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Loaded ${loaded} commands`);
    } catch (err) {
      errors++;
      names.push(file);
      process.stdout.write("\n");
      global.log(`Error loading command '${file}': ${err.message}`, "blue", true);
    }
  }
}

process.stdout.write("\n");
global.log(`Commands Loaded: ${loaded}`, "cyan", false);
global.log(`Errors: ${errors}`, "red", false);
if (names.length > 0) {
  global.log(`Failed to load commands: ${names.join(", ")}`, "red", false);
}

module.exports = null;