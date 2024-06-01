process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};
const use_global = process.env['GLOBAL_COMMANDS'] || true;

// Will fix this later

require("./global");

log("Starting Bot", "grey", true);

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

if (use_global) {
  require("./script/command.js");
} else {
  log("change the bool of GLOBAL_COMMANDS to true", "red", true)
  process.exit(3)
}

let userModel = undefined;
let DB = undefined;
let update = undefined;

if (process.env["CONNECT_DB"] == 'true') {
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

if (process.env["CONNECT_DB"] == 'true') {
  connectDB().then((x) => {
    if (x) log("Logged in with DB", "green", false)
    else log("Did not connect to DB")
  });
}

log("Started Bot", "cyan", true);