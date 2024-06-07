const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./Database/SQLite/data.db', (err) => {
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