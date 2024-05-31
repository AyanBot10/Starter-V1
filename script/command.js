const path = require("path");
const { readdirSync } = require("fs");

function run() {
  global.log("Binding Commands...", "green", false);
  let errors = 0;
  let loaded = 0;
  global.cmds = new Map();
  const commandsPath = path.join(__dirname, "commands");
  const files = readdirSync(commandsPath);

  try {
    for (let file of files) {
      if (file.endsWith(".js")) {
        const command = require(path.join(commandsPath, file));
        global.cmds.set(file, command);
        loaded++;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Bonded ${loaded} commands`);
      }
    }
  } catch (err) {
    errors++;
    global.log(`Caught ${errors} error(s) while binding commands`, "red", false);
  } finally {
    process.stdout.write("\n");
    global.log(`Commands bonded: ${loaded}`, "red", false);
    return null;
  }
}

module.exports = run;