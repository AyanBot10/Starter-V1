function main() {
  const exports = require("./manager")
  for (let funcs of Object.keys(exports)) {
    global.sqlite[funcs] = exports[funcs]
  }
  global.log("Loaded SQLite Items", "gray")
}

module.exports = main