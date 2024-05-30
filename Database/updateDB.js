const userModel = require("./user.js")

async function updateDB(msg) {
  try {
    const existingUser = await userModel.findOne({ userId: msg.from.id });

    if (!existingUser) {
      await userModel.findOneAndUpdate({ userId: msg.from.id },
      {
        $setOnInsert: {
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
          isBot: msg.from.is_bot,
          username: msg.from.username,
        },
      }, { upsert: true, new: true });
      global.log(`New User ${msg.from.username}`, "pink", false)
    }
  } catch (error) {
    global.log("Failed To Connect to DB " + error, "white", false)
  }
}

module.exports = updateDB