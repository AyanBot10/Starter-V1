const { User, Thread } = require('./schema');
const initiate = require("./index")

async function upsertUserData(userId, data) {
  try {
    if (!initiate) await initiate;
    const jsonData = JSON.stringify(data);
    await User.findOneAndUpdate({ id: userId }, { data: jsonData }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return { status: 200, message: "User data upserted successfully" };
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function getUserData(userId) {
  try {
    if (!initiate) await initiate;
    const user = await User.findOne({ id: userId });
    if (user) {
      return JSON.parse(user.data);
    } else {
      return 404;
    }
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function deleteUser(userId) {
  try {
    if (!initiate) await initiate;
    const result = await User.deleteOne({ id: userId });
    return result.deletedCount === 0 ? 404 : 200;
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function getAllUsers() {
  try {
    if (!initiate) await initiate;
    const users = await User.find({});
    return users.map(user => JSON.parse(user.data));
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function exists(userId) {
  try {
    if (!initiate) await initiate;
    const count = await User.countDocuments({ id: userId });
    return count > 0;
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function createOrUpdateUser(userId, newData) {
  try {
    if (!initiate) await initiate;
    const existingData = await getUserData(userId);
    if (existingData === 404) {
      return 404;
    }
    const updatedData = { ...existingData, ...newData };
    return upsertUserData(userId, updatedData);
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
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

async function upsertThreadData(threadId, data) {
  try {
    if (!initiate) await initiate;
    const jsonData = JSON.stringify(data);
    await Thread.findOneAndUpdate({ id: threadId }, { data: jsonData }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return { status: 200, message: "Thread data upserted successfully" };
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function getThreadData(threadId) {
  try {
    if (!initiate) await initiate;
    const thread = await Thread.findOne({ id: threadId });
    if (thread) {
      return JSON.parse(thread.data);
    } else {
      return 404;
    }
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function deleteThread(threadId) {
  try {
    if (!initiate) await initiate;
    const result = await Thread.deleteOne({ id: threadId });
    return result.deletedCount === 0 ? 404 : 200;
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function getAllThreads() {
  try {
    if (!initiate) await initiate;
    const threads = await Thread.find({});
    return threads.map(thread => JSON.parse(thread.data));
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function threadExists(threadId) {
  try {
    if (!initiate) await initiate;
    const count = await Thread.countDocuments({ id: threadId });
    return count > 0;
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

async function createOrUpdateThread(threadId, newData) {
  try {
    if (!initiate) await initiate;
    const existingData = await getThreadData(threadId);
    if (existingData === 404) {
      return 404;
    }
    const updatedData = { ...existingData, ...newData };
    return upsertThreadData(threadId, updatedData);
  } catch (err) {
    throw new Error('Database error: ' + err.message);
  }
}

createOrUpdateThread.force = async function(threadId, newData) {
  return upsertThreadData(threadId, newData);
};

createOrUpdateThread.empty = async function(threadId) {
  return upsertThreadData(threadId, {});
};

createOrUpdateThread.refresh = async function(threadId, event) {
  return upsertThreadData(threadId, { ...event.chat, isBanned: false });
};

async function removeThreadKey(threadId, keys) {
  try {
    const existingData = await getThreadData(threadId);
    if (existingData === 404) {
      return 404;
    }
    keys.forEach(key => delete existingData[key]);
    return upsertThreadData(threadId, existingData);
  } catch (error) {
    throw new Error('Failed to remove keys: ' + error.message);
  }
}

module.exports = {
  usersData: {
    update: createOrUpdateUser,
    retrieve: getUserData,
    delete: deleteUser,
    getAll: getAllUsers,
    exists,
    create: createOrUpdateUser.empty,
    refresh: createOrUpdateUser.refresh,
    removeKey
  },
  threadsData: {
    update: createOrUpdateThread,
    retrieve: getThreadData,
    delete: deleteThread,
    getAll: getAllThreads,
    exists: threadExists,
    create: createOrUpdateThread.empty,
    refresh: createOrUpdateThread.refresh,
    removeKey: removeThreadKey
  }
};