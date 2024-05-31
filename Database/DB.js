const mongoose = require('mongoose')

module.exports = () => {
  if (!process.env['MONGO_URI']) {
    global.log("MongoURI not provided", 'red', false)
    process.exit(2)
  }
  return mongoose.connect(process.env['MONGO_URI']);
}