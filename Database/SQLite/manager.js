const db = require('./index');

function upsertUserData(userId, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);
    db.run(
      `INSERT INTO users (id, data) VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [userId, jsonData],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(200);
        }
      }
    );
  });
}

function getUserData(userId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT data FROM users WHERE id = ?`, [userId], (err, row) => {
      if (err) {
        reject(new Error('Database error'));
      } else if (!row) {
        resolve(404);
      } else {
        resolve(JSON.parse(row.data));
      }
    });
  });
}

function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(404);
      } else {
        resolve(200);
      }
    });
  });
}

function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id FROM users`, (err, rows) => {
      if (err) {
        reject(new Error('Database error'));
      } else {
        const users = rows.map(row => row.id);
        resolve(users);
      }
    });
  });
}

function deleteAllUsers() {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users`, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(200);
      }
    });
  });
}

function exists(userId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM users WHERE id = ?`, [userId], (err, row) => {
      if (err) {
        reject(new Error('Database error'));
      } else {
        resolve(row.count > 0);
      }
    });
  });
}

function createOrUpdateUser(userId, newData) {
  return getUserData(userId).then(existingData => {
    if (existingData === 404) {
      return 404;
    }
    const updatedData = { ...existingData, ...newData };
    return upsertUserData(userId, updatedData);
  });
}

createOrUpdateUser.force = function(userId, newData) {
  return upsertUserData(userId, newData);
};

createOrUpdateUser.reset = function(userId) {
  return upsertUserData(userId, {});
};

createOrUpdateUser.refresh = function(userId, event) {
  return upsertUserData(userId, { ...event.from });
};

module.exports = {
  update: createOrUpdateUser,
  retrieve: getUserData,
  delete: deleteUser,
  getAll: getAllUsers,
  deleteAll: deleteAllUsers,
  exists,
  create: createOrUpdateUser.reset,
  refresh: createOrUpdateUser.refresh
};