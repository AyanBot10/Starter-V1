const db = require('./index');

function upsertUserData(userId, data, callback) {
  const jsonData = JSON.stringify(data);
  db.run(
    `INSERT INTO users (id, data) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
    [userId, jsonData],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    }
  );
}

function createOrUpdateUser(userId, newData, callback) {
  getUserData(userId, (err, existingData) => {
    if (err) {
      return callback(err);
    }
    if (existingData === 404) {
      return callback(null, 404);
    }
    const updatedData = { ...existingData, ...newData };
    upsertUserData(userId, updatedData, callback);
  });
}

createOrUpdateUser.force = function(userId, newData, callback) {
  upsertUserData(userId, newData, callback);
};

function getUserData(userId, callback) {
  db.get(`SELECT data FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      return callback(new Error('Database error'));
    }
    if (!row) {
      return callback(null, 404);
    }
    callback(null, JSON.parse(row.data));
  });
}

module.exports = {
  update: createOrUpdateUser,
  retrieve: getUserData
};