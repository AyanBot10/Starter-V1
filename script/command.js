const path = require("path");
const { readdirSync } = require("fs");

global.log("Binding Commands...", "yellow", false);

let errors = 0;
let loaded = 0;
let failedFiles = [];
global.cmds = new Map();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = readdirSync(commandsPath);

commandFiles.forEach((file) => {
  if (global.config?.handler?.skip?.includes(file)) return;

  if (file.endsWith(".js")) {
    try {
      const command = require(path.join(commandsPath, file));
      global.cmds.set(file, command);
      loaded++;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Loaded ${loaded} commands`);
    } catch (error) {
      errors++;
      failedFiles.push(file);
      process.stdout.write("\n");
      global.log(`Error loading command '${file}': ${error.message}`, "blue", true);
    }
  }
});

process.stdout.write("\n");
global.log(`Commands Loaded: ${loaded}`, "cyan", false);
global.log(`Errors: ${errors}`, "red", false);

if (failedFiles.length > 0) {
  global.log(`Failed to load commands: ${failedFiles.join(", ")}`, "red", false);
}

module.exports = null;