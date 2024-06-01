const { spawn } = require("child_process");
const log = require("./logger/chalk.js");

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}`, "red*");
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason.message);
});

require('dotenv').config();

function startProject() {
  const child = spawn("node", ["main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (code) => {
    if (code === 2) {
      log("Error occurred while connecting to MongoDB", "red", true);
      console.log("Exiting Process, Resolve Issue")
      process.exit(3)
    }
  });
}

startProject();