process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};

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

if (process.env["CONNECT_MONGODB"] == 'true') {
  userModel = require("./Database/MongoDB/user.js");
  DB = require("./Database/MongoDB/DB.js");
  update = require("./Database/MongoDB/updateDB.js");
  global.mongo.update = update;
}

if (process.env['CONNECT_SQLITE'] == 'true') {
  run_sqlite();
}

require("./handler/handler.js");

async function connectDB() {
  if (!process.env["CONNECT_MONGODB"]) return false
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

if (process.env["CONNECT_MONGODB"] == 'true') {
  connectDB().then((x) => {
    log("Logged in with DB", "green", false)
  });
}

log("Started Bot", "cyan", true);

if (config?.server?.toggle && config?.server?.port) {
  log("Starting Express Server", "green")
  try {
    require("./server/index.js");
  } catch (err) {
    log("Failed to start server", "red", true)
    log(err.message, "red")
  }
}