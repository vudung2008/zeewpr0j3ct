const mongoose = require('mongoose');
const logger = require('../logger');
const config = require('../config');

async function connectDatabase(client) {
  if (!config.MongoDB) {
    const getText = client?.getText || (() => 'MongoDB URI is empty. Skipping database connection.');
    logger(getText('notFoundAppstate'), 'warn');
    return null;
  }

  try {
    await mongoose.connect(config.MongoDB);
    const getText = client?.getText || (() => 'Connected to Database success!');
    logger(getText('successConnectDB'), 'success');
    return mongoose;
  } catch (error) {
    logger(`Database connection failed: ${error.message}`, 'error');
    return null;
  }
}

module.exports = { connectDatabase };
