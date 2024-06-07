const sqlite3 = require('sqlite3').verbose();
const path = require("path");

let db = new sqlite3.Database(path.join(__dirname, 'data.db'), (err) => {
  if (err) {
    console.error(err.message);
  }
  global.log('Connected to the SQLite', 'cyan');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    data TEXT
)`);

module.exports = db;