process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};
const config = require("./config.json");
require("./global");
const run_sqlite = require("./Database/SQLite/global.js")

var log = global.log;

log("Starting Bot", "grey", true);

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}`, "red");
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled Rejection:\n${reason.message}`, 'red');
});

require("./script/command.js");


let userModel = undefined;
let DB = undefined;
let update = undefined;

if (global.config.mongodb["CONNECT_MONGODB"]) {
  userModel = require("./Database/MongoDB/user.js");
  DB = require("./Database/MongoDB/DB.js");
  update = require("./Database/MongoDB/updateDB.js");
  global.mongo.update = update;
}

if (global.config.DATABASE.sqlite['CONNECT_SQLITE']) {
  run_sqlite();
}

require("./handler/handler.js");

async function connectDB() {
  if (!global.config.DATABASE.mongodb["CONNECT_MONGODB"]) return false
  try {
    log("Connecting To MongoDB", "red", false);
    await DB();
    log("Connection Successful", "green", true);
    return true
  } catch (err) {
    log("Failed to Connect to Database " + err, "red", true);
    process.exit(1);
  }
}

if (global.config.DATABASE.mongodb["CONNECT_MONGODB"]) {
  connectDB().then((x) => {
    log("Logged in with DB", "green", false)
  });
}

log("Started Bot", "cyan", true);

if (config?.server?.toggle && config?.server?.port) {
  log("Starting Express Server", "green")
  try {
    global.server = {};
    global.server.logs = [];
    require("./server/index.js");
  } catch (err) {
    log("Failed to start server", "red", true)
    log(err.message, "red")
  }
}