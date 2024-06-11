const mongoose = require('mongoose')

module.exports = () => {
  if (!global.config.DATABASE.mongodb['MONGO_URI']) {
    global.log("MongoURI not provided", 'red', false)
    process.exit(2)
  }
  return mongoose.connect(global.config.DATABASE.mongodb['MONGO_URI']);
}