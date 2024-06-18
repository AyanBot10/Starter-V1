function main() {
  const exports = require("./manager");
  global.mongo = {
    usersData: {},
    threadsData: {}
  };
  for (let usersData of Object.keys(exports.usersData)) {
    global.mongo.usersData[usersData] = exports.usersData[usersData];
  }
  for (let threadsData of Object.keys(exports.threadsData)) {
    global.mongo.threadsData[threadsData] = exports.threadsData[threadsData];
  }

  global.log("Loaded MongoDB", "gray");
}

module.exports = main;