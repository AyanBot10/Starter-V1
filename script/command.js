function run() {
  global.log("Binding Commands...", "green", false)
  let errors = 0;
  let loaded = 0;
  const path = require("path");
  const { readdirSync } = require("fs");
  global.cmds = new Map();
  const commandsPath = path.join(__dirname, "commands");
  const files = readdirSync(commandsPath);
  try {
    for (let file of files) {
      if (file.endsWith(".js")) {
        const command = require(path.join(commandsPath, file));
        global.cmds.set(file, command)
        loaded++
        process.stdout.write(`Bonded ${loaded} commands`)
      }
    }
  } catch (err) {
    errors++
    log(`Caught ${errors} while binding commands`, "red", false)
  } finally {
    log(`Commands bonded: ${loaded}`, "red", false)
    return null
  }
}

module.exports = run