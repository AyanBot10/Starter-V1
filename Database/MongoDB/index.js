const mongoose = require('mongoose');

if (!global.config.DATABASE.mongodb['MONGO_URI']) {
  global.log("MongoURI not provided", 'red')
  process.exit(2)
}

const instance = mongoose.connect(global.config.DATABASE.mongodb['MONGO_URI']).then(() => {
  global.log('Connected to MongoDB', "cyan", true);
}).catch(err => {
  global.log('MongoDB connection error: ' + err.message, "red", true);
  process.exit(2)
});

module.exports = instance