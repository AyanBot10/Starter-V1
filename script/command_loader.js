const path = require("path");
const { readdirSync } = require("fs");

let errors = 0;
let loadedCommands = 0;
let loadedEvents = 0;
let failedCommands = [];
let failedEvents = [];

const commandNames = new Set();
const eventNames = new Set();
global.cmds = new Map();
global.events = new Map();

async function loadFiles(files, basePath, type) {
  if (type == "commands") global.log("Loading Commands...", "yellow", false);
  if (type == "events") global.log("Loading Events...", "yellow", false);
  files.forEach((file) => {
    if (global.config_handler?.skip?.[type].includes(file)) return;
    if (!file.endsWith(".js")) return;
    try {
      let filePath = path.join(basePath, file);
      const item = require(filePath);

      if (!item.config || !item.config.name) throw new Error("config and/or config.name not set");
      if (!item.start || typeof item.start !== "function") throw new Error("function start not set");

      item.config.path = filePath;
      if ((type === "commands" && commandNames.has(item.config.name)) ||
        (type === "events" && eventNames.has(item.config.name))) {
        throw new Error(`${item.config.name} Already Exists`);
      }

      if (type === "commands") {
        if (item.config.aliases) {
          if (!Array.isArray(item.config.aliases)) throw new Error("aliases must be an array");
          const aliases = item.config.aliases.filter(alias => alias.length > 0);
          if (aliases.some(alias => commandNames.has(alias))) {
            throw new Error(`${[item.config.name, ...aliases].join(", ")} Already Exists in other files`);
          }
          aliases.forEach(alias => commandNames.add(alias));
        }
        global.cmds.set(file, item);
        loadedCommands++;
        commandNames.add(item.config.name);
      } else {
        global.events.set(file, item);
        loadedEvents++;
        eventNames.add(item.config.name);
      }
    } catch (error) {
      errors++;
      if (type === "commands") {
        failedCommands.push(file);
      } else {
        failedEvents.push(file);
      }
      process.stdout.write("\n");
      global.log(`'${file}': ${error.message}`, "red", true);
    } finally {
      process.stdout.cursorTo(0);
      process.stdout.write(`Loaded ${type === "commands" ? loadedCommands + " commands" : loadedEvents + " events"}`);
    }
  });
  process.stdout.write("\n");
  process.stdout.clearLine();
  if (type === "commands")
    global.log(`Commands Loaded: ${loadedCommands}`, "blue", false);
  if (type === "events")
    global.log(`Events Loaded: ${loadedEvents}`, "blue", false);
};

async function loadAll() {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = readdirSync(commandsPath);
  await loadFiles(commandFiles, commandsPath, "commands");
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = readdirSync(eventsPath);
  await loadFiles(eventFiles, eventsPath, "events");
}

global.log(`Errors: ${errors}`, "red", false);

if (failedCommands.length > 0) {
  global.log(`Failed to load commands: ${failedCommands.join(", ")}`, "red", false);
}
if (failedEvents.length > 0) {
  global.log(`Failed to load events: ${failedEvents.join(", ")}`, "red", false);
}

loadAll()