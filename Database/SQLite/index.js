const sqlite3 = require('sqlite3').verbose();
const path = require("path");

let db = new sqlite3.Database(path.join(__dirname, 'data.db'), (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  global.log('Connected to the SQLite database', 'cyan');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    data TEXT
)`, (err) => {
  if (err) {
    console.error('Error creating users table:', err.message);
  }
});

db.run(`CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    data TEXT
)`, (err) => {
  if (err) {
    console.error('Error creating Threads table:', err.message);
  }
});

module.exports = db;