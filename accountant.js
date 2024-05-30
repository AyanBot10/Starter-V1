const fs = require("fs");

async function run() {
  const config = JSON.parse(fs.readFileSync("config.json", 'utf-8'));
  Object.entries(config).forEach(([value, key]) => {
    global.config[key] = value;
  });
}

module.exports = run