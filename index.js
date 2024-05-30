const { spawn } = require("child_process");
const log = require("./logger/chalk.js");

function startProject() {
  const child = spawn("node", ["main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (code) => {
    if (code == 1) {
      log("Error occurred while connecting to MongoDB", "red", true);
      console.log("Exiting Process, Resolve Issue")
      process.exit(3)
    }
  });
}

startProject();