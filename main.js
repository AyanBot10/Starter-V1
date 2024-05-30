process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
    // Disabled Deprecation alerts
  }
};

require("./global.js")();
require("./accountant.js")();
const log = require("./logger/chalk.js")
global.log = log;
log("Starting Bot", "cyan", true)
// text, color, Bold (bool)

const context = false
const database_connection = false;
// Disable connection to database

const fs = require("fs")
const config = JSON.parse(fs.readFileSync("config.json", 'utf-8'));
require("./script/command.js")();

const userModel = require("./Database/user.js")
const DB = require("./Database/DB.js")
const update = require("./Database/updateDB.js")

require("./handler/handler.js")();

async function connectDB() {
  try {
    log("Connecting To MongoDB", "red", false)
    await DB()
    log("Connection Successful", "green", true)
  } catch (err) {
    log("Failed to Connect to Database " + err, "red", true)
    process.exit(1)
  }
}

if (database_connection) {
  connectDB().then(() => {
    log("Logged in while connected to mongodb", "green", false)
  })
}

log("Started Bot", "cyan", true)