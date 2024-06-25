process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}\n${err.stack}`, "red");
});

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error) {
    log(`Unhandled Rejection: ${reason.message}\n${reason.stack}`, "red");
  } else {
    log(`Unhandled Rejection: ${reason}`, "red");
  }
});
const { existsSync } = require("fs");

if (!existsSync(".env")) {
  log(".env DOESN'T EXISTS", "red", true)
  process.exit(1)
}
require('dotenv').config();
const config = require("./config.json");
require("./starter");
const run_sqlite = require("./Database/SQLite/global.js");
const run_mongo = require("./Database/MongoDB/global.js");

var log = global.log;

log("Starting Bot", "grey", true);

require("./script/command_loader")

if (config.DATABASE.mongodb["CONNECT_MONGODB"]) {
  if (config.DATABASE.sqlite['CONNECT_SQLITE']) {
    global.log("CHOOSE ONLY ONE DATABASE", "red", true)
    process.exit(2)
  }
  if (!config.DATABASE.mongodb["MONGO_URI"]) {
    global.log("Provide MONGO_URI", "red", true)
    process.exit(2)
  }
  run_mongo();
}

if (config.DATABASE.sqlite['CONNECT_SQLITE']) {
  if (config.DATABASE.mongodb["CONNECT_MONGODB"]) {
    global.log("CHOOSE ONLY ONE DATABASE", "red", true)
    process.exit(2)
  }
  run_sqlite();
}

require("./handler/handler.js");

if (config?.server?.toggle && config?.server?.port) {
  log("Starting Express Server", "green");
  try {
    global.server = {};
    global.server.logs = [];
    require("./server/index.js");
  } catch (err) {
    log("Failed to start server", "red", true);
    log(err.message, "red");
  }
}

global.log("Logged into Bot", "cyan", true);