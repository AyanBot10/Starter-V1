const db = require('./index');

function upsertUserData(userId, data) {
  return new Promise((resolve, reject) => {
    if (typeof userId === "string") {
      userId = parseInt(userId, 10);
    }
    if (isNaN(userId)) {
      return reject(new Error("UserID must be an integer"));
    }
    const jsonData = JSON.stringify(data);
    db.run(
      `INSERT INTO users (id, data) VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [userId, jsonData],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ status: 200, message: "User data upserted successfully" });
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

async function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id FROM users`, async (err, rows) => {
      if (err) {
        reject(new Error('Database error'));
      } else {
        try {
          const accs = await Promise.all(rows.map(async n => {
            return await getUserData(n.id);
          }));
          resolve(accs);
        } catch (error) {
          reject(new Error('Error fetching user data'));
        }
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

async function createOrUpdateUser(userId, newData) {
  const existingData = await getUserData(userId);
  if (existingData === 404) {
    return 404;
  }
  const updatedData = { ...existingData, ...newData };
  return upsertUserData(userId, updatedData);
}

createOrUpdateUser.force = async function(userId, newData) {
  return upsertUserData(userId, newData);
};

createOrUpdateUser.empty = async function(userId) {
  return upsertUserData(userId, {});
};

createOrUpdateUser.refresh = async function(userId, event) {
  return upsertUserData(userId, { ...event.from, isBanned: false });
};

async function removeKey(userId, keys) {
  try {
    const existingData = await getUserData(userId);
    if (existingData === 404) {
      return 404;
    }
    keys.forEach(key => delete existingData[key]);
    return upsertUserData(userId, existingData);
  } catch (error) {
    throw new Error('Failed to remove keys: ' + error.message);
  }
}

const threadsData = {
  upsertUserData(threadId, data) {
    return new Promise((resolve, reject) => {
      if (typeof threadId === "string") {
        threadId = parseInt(threadId, 10);
      }
      if (isNaN(threadId)) {
        return reject(new Error("threadID must be an integer"));
      }
      const jsonData = JSON.stringify(data);
      db.run(
        `INSERT INTO threads (id, data) VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [threadId, jsonData],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ status: 200, message: "Thread data upserted successfully" });
          }
        }
      );
    });
  },

  getThreadData(threadId) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT data FROM threadId WHERE id = ?`, [threadId], (err, row) => {
        if (err) {
          reject(new Error('Database error'));
        } else if (!row) {
          resolve(404);
        } else {
          resolve(JSON.parse(row.data));
        }
      });
    });
  },

  deleteThread(threadId) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM threadId WHERE id = ?`, [threadId], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(404);
        } else {
          resolve(200);
        }
      });
    });
  },

  getAllThreads() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT id FROM threadId`, (err, rows) => {
        if (err) {
          reject(new Error('Database error'));
        } else {
          resolve(rows);
        }
      });
    });
  },

  threadExists(threadId) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM threadId WHERE id = ?`, [threadId], (err, row) => {
        if (err) {
          reject(new Error('Database error'));
        } else {
          resolve(row.count > 0);
        }
      });
    });
  },

  async createOrUpdateThread(threadId, newData) {
    const existingData = await this.getThreadData(threadId);
    if (existingData === 404) {
      return 404;
    }
    const updatedData = { ...existingData, ...newData };
    return this.upsertThreadData(threadId, updatedData);
  },

  async removeKey(threadId, keys) {
    try {
      const existingData = await this.getThreadData(threadId);
      if (existingData === 404) {
        return 404;
      }
      keys.forEach(key => delete existingData[key]);
      return this.upsertThreadData(threadId, existingData);
    } catch (error) {
      throw new Error('Failed to remove keys: ' + error.message);
    }
  }
};

threadsData.createOrUpdateThread.force = async function(threadId, newData) {
  return threadsData.upsertThreadData(threadId, newData);
};

threadsData.createOrUpdateThread.empty = async function(threadId) {
  return threadsData.upsertThreadData(threadId, {});
};

threadsData.createOrUpdateThread.refresh = async function(threadId, event, api) {
  const admins = event.chat.type !== "private" ? await api.getChatAdministrators(event.chat.id).map(x => x.user) : [null]
  return threadsData.upsertThreadData(threadId, { ...admins, ...event.chat, isBanned: false });
};

module.exports = {
  threadsData: {
    update: threadsData.createOrUpdateThread,
    retrieve: threadsData.getThreadData,
    delete: threadsData.deleteThread,
    getAll: threadsData.getAllThreads,
    exists: threadsData.threadExists,
    create: threadsData.createOrUpdateThread.empty,
    refresh: threadsData.createOrUpdateThread.refresh,
    removeKey: threadsData.removeKey
  },
  usersData: {
    update: createOrUpdateUser,
    retrieve: getUserData,
    delete: deleteUser,
    getAll: getAllUsers,
    // deleteAll: deleteAllUsers,
    exists,
    create: createOrUpdateUser.empty,
    refresh: createOrUpdateUser.refresh,
    removeKey
  }
};