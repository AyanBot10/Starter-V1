const mongoose = require('mongoose')
const config = JSON.parse(fs.readFileSync("../config.json", 'utf-8'));

module.exports = () => {
  if (!process.env.MONGO_URI || !config.MONGO_URI) {
    console.error("MongoURI not provided")
    process.exit(1)
  }
  return mongoose.connect(process.env.MONGO_URI);
}