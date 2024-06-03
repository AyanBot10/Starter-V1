const db = require('./index');

function upsertUserData(userId, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);
    db.run(
      `INSERT INTO users (id, data) VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [userId, jsonData]
    ).then(() => resolve(200)).catch(reject);
  });
}

function getUserData(userId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT data FROM users WHERE id = ?`, [userId])
      .then(row => {
        if (!row) resolve(404);
        else resolve(JSON.parse(row.data));
      })
      .catch(err => reject(new Error('Database error')));
  });
}

function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE id = ?`, [userId])
      .then(() => resolve(200))
      .catch(reject);
  });
}

function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id FROM users`)
      .then(rows => {
        const users = rows.map(row => row.id);
        resolve(users);
      })
      .catch(err => reject(new Error('Database error')));
  });
}

function deleteAllUsers() {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users`)
      .then(() => resolve(200))
      .catch(reject);
  });
}

function createOrUpdateUser(userId, newData) {
  return getUserData(userId).then(existingData => {
    if (existingData === 404) return 404;
    const updatedData = { ...existingData, ...newData };
    return upsertUserData(userId, updatedData);
  });
}

createOrUpdateUser.force = function(userId, newData) {
  return upsertUserData(userId, newData);
};

function userExists(userId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id FROM users WHERE id = ?`, [userId])
      .then(row => resolve(!!row))
      .catch(err => reject(new Error('Database error')));
  });
}

function create(userId) {
  return upsertUserData(userId, {});
}

module.exports = {
  update: createOrUpdateUser,
  retrieve: getUserData,
  getAll: getAllUsers,
  deleteAll: deleteAllUsers,
  exists: userExists,
  create,
  remove: deleteUser
};