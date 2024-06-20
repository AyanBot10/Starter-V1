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

const logLoadingStatus = (type, color) => global.log(`Loading ${type}...`, color, false);
const logLoadedStatus = (type, count, color) => global.log(`${type} Loaded: ${count}`, color, false);
const logErrorStatus = (file, message, color) => global.log(`'${file}': ${message}`, color, true);

const validateItemConfig = (item, type, filePath) => {
  if (!item.config || !item.config.name) throw new Error("config and/or config.name not set");
  if (!item.start || typeof item.start !== "function") throw new Error("start function not set or not a function");

  item.config.path = filePath;

  if (type === "commands") {
    if (commandNames.has(item.config.name)) throw new Error(`${item.config.name} already exists`);

    if (item.config.aliases) {
      if (!Array.isArray(item.config.aliases)) throw new Error("aliases must be an array");

      const aliases = item.config.aliases.filter(alias => alias.length > 0);
      if (aliases.some(alias => commandNames.has(alias))) throw new Error(`${[item.config.name, ...aliases].join(", ")} already exists in other files`);

      aliases.forEach(alias => commandNames.add(alias));
    }

    commandNames.add(item.config.name);
  } else if (type === "events") {
    if (eventNames.has(item.config.name)) throw new Error(`${item.config.name} already exists`);
    eventNames.add(item.config.name);
  }
};

const loadFiles = async (files, basePath, type) => {
  logLoadingStatus(type, "yellow");

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    const filePath = path.join(basePath, file);
    const item = require(filePath);

    try {
      if (global.config_handler?.skip?.[type]?.includes(item?.config?.name)) {
        if (type === "commands" && global.cmds.has(item?.config?.name)) continue;
        if (type === "events" && global.events.has(file)) continue;
      }

      validateItemConfig(item, type, filePath);

      if (type === "commands") {
        global.cmds.set(file, item);
        loadedCommands++;
      } else {
        global.events.set(file, item);
        loadedEvents++;
      }
    } catch (error) {
      errors++;
      if (type === "commands") failedCommands.push(file);
      else failedEvents.push(file);

      logErrorStatus(file, error.message, "red");
    } finally {
      process.stdout.cursorTo(0);
      process.stdout.write(`Loaded ${type === "commands" ? loadedCommands : loadedEvents} ${type}`);
    }
  }

  process.stdout.write("\n");
  process.stdout.clearLine();
  logLoadedStatus(type.charAt(0).toUpperCase() + type.slice(1), type === "commands" ? loadedCommands : loadedEvents, "blue");
};

const loadAll = async () => {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = readdirSync(commandsPath);
  await loadFiles(commandFiles, commandsPath, "commands");

  const eventsPath = path.join(__dirname, "events");
  const eventFiles = readdirSync(eventsPath);
  await loadFiles(eventFiles, eventsPath, "events");
};

loadAll().then(() => {
  global.log(`Errors: ${errors}`, "red", false);

  if (failedCommands.length > 0) {
    global.log(`Failed to load commands: ${failedCommands.join(", ")}`, "red", false);
  }

  if (failedEvents.length > 0) {
    global.log(`Failed to load events: ${failedEvents.join(", ")}`, "red", false);
  }
});