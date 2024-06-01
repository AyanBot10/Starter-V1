process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};

const log = require("./logger/chalk.js");
global.log = log;
require("./global.js")();
log("Starting Bot", "cyan", true);

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

require("./script/command.js")();

let userModel = undefined;
let DB = undefined;
let update = undefined;

if (process.env["CONNECT_DB"] === true) {
  userModel = require("./Database/user.js");
  DB = require("./Database/DB.js");
  update = require("./Database/updateDB.js");
  global.update = update;
}

require("./handler/handler.js");

async function connectDB() {
  if (!process.env["CONNECT_DB"]) return false
  try {
    log("Connecting To MongoDB", "red", false);
    await DB();
    log("Connection Successful", "green", true);
  } catch (err) {
    log("Failed to Connect to Database " + err, "red", true);
    process.exit(1);
  }
}

if (process.env["CONNECT_DB"] === true) {
  connectDB().then((x) => {
    if (x) log("Logged in with DB", "green", false)
    else log("Did not connect to DB")
  });
}

log("Started Bot", "cyan", true);