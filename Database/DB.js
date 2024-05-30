const mongoose = require('mongoose')

module.exports = () => {
  if (!process.env.MONGO_URI || !process.bot.config.MONGO_URI) {
    console.error("MongoURI not provided")
    process.exit(1)
  }
  return mongoose.connect(process.env.MONGO_URI);
}