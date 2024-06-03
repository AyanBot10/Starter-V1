const db = require('./index');

function upsertUserData(userId, data) {
  const jsonData = JSON.stringify(data);
  db.run(
    `INSERT INTO users (id, data) VALUES (?, ?)
         ON CONFLICT(id) DO UPDATE SET data=excluded.data`,
        [userId, jsonData],
    function(err) {
      if (err) {
        return console.log(err.message);
      }
      return 200
    }
  );
}

function createOrUpdateUser(userId, newData) {
  try {
    getUserData(userId, (existingData) => {
      if (existingData) {
        const updatedData = { ...existingData, ...newData };
        upsertUserData(userId, updatedData);
      } else {
        return 404
      }
    });
  } catch (err) {
    throw err
  }
}

createOrUpdateUser.force = function(userId, newData) {
  upsertUserData(userId, newData);
};

function getUserData(userId, callback) {
  db.get(`SELECT data FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      return callback(new Error('Database error'), null);
    }
    if (!row) {
      return callback(null, 404);
    }
    callback(null, JSON.parse(row.data));
  });
}

module.exports = {
  update: createOrUpdateUser,
  retrive: getUserData
};