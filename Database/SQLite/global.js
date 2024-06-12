function main() {
  const exports = require("./manager");
  global.sqlite = {
    usersData: {},
    threadsData: {}
  };
  for (let usersData of Object.keys(exports.usersData)) {
    global.sqlite.usersData[usersData] = exports.usersData[usersData];
  }
  for (let threadsData of Object.keys(exports.threadsData)) {
    global.sqlite.threadsData[threadsData] = exports.threadsData[threadsData];
  }

  global.log("Loaded SQLite", "gray");
}

module.exports = main;