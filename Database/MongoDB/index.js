const mongoose = require('mongoose');

if (!global.config.DATABASE.mongodb['MONGO_URI']) {
  global.log("MongoURI not provided", 'red')
  process.exit(2)
}

mongoose.connect(global.config.DATABASE.mongodb['MONGO_URI'], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
});

module.exports = mongoose;