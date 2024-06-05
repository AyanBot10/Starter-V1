const { spawn } = require("child_process");
const log = require("./logger/chalk.js");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}`, "red");
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled Rejection: ${reason.message}`, 'red');
});

function startProject() {
  const child = spawn("node", ["main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    handle_code(code);
  });
}

function handle_code(code) {
  switch (code) {
    case 2:
      log("Error occurred while connecting to MongoDB", "red", true);
      console.log("Exiting Process, Resolve Issue");
      process.exit(3);
      break;
    case 4:
      log("Restarting Project", "cyan", true);
      clearDirectorySync("script/commands/tmp");
      log("Cleared Cache", "cyan");
      startProject();
      break;
    default:
      log(`Child process exited with code ${code}`, "yellow");
      break;
  }
}

function clearDirectorySync(directory) {
  try {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      if (file == "restart.json") continue
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        clearDirectorySync(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error(`Error clearing directory ${directory}:`, err);
  }
}

startProject();