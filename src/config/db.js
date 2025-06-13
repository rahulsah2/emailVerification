const mongoose = require('mongoose');
const logger = require('../utils/logger');
const {envConfig}= require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.MONGO_URI, {
      useNewUrlParser : true,
      useUnifiedTopology: true,
    });
    logger.info('connected to mongoDB');
  } catch (err) {
   logger.error('MongoDB connection error');
   throw err;
  }
};
module.exports = connectDB;
