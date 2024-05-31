process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};

const log = require("./logger/chalk.js");
global.log = log;
require("./global.js")();
log("Starting Bot", "cyan", true);

require("./script/command.js")();

const userModel = require("./Database/user.js");
const DB = require("./Database/DB.js");
const update = require("./Database/updateDB.js");
global.update = update;

require("./handler/handler.js");

async function connectDB() {
  try {
    log("Connecting To MongoDB", "red", false);
    await DB();
    log("Connection Successful", "green", true);
  } catch (err) {
    log("Failed to Connect to Database " + err, "red", true);
    process.exit(1);
  }
}

if (process.env["CONNECT_DB"]) {
  connectDB().then(() => {
    log("Logged in with DB", "green", false);
  });
}

log("Started Bot", "cyan", true);