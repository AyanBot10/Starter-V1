const { spawn } = require("child_process");
const log = require("./logger/chalk.js");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
      startProject();
      break;
    default:
      log(`Child process exited with code ${code}`, "yellow");
      break;
  }
}


startProject();