const fs = require('fs');
const path = require('path');
const login = require('@dongdev/fca-unofficial');
const logger = require('./logger');
const config = require('./config');
const { connectDatabase } = require('./database/connection');
const { loadPlugins } = require('./bot/pluginRegistry');
const { createListener } = require('./bot/listener');
const { createCallbackRegistry } = require('./bot/callbackRegistry');
const { loadLanguage, createTranslator } = require('./i18n');

function startBot(client) {
  const appStatePath = path.resolve(config.APPSTATEPATH);
  if (!fs.existsSync(appStatePath)) {
    client.logger(client.getText('notFoundAppstate'), 'error');
    return false;
  }

  let appState;
  try {
    appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
  } catch (error) {
    client.logger(client.getText('errorLoadEvent', error.message), 'error');
    return false;
  }

  login({ appState }, (error, api) => {
    if (error) {
      client.logger(JSON.stringify(error), 'error');
      return;
    }

    client.api = api;
    api.setOptions(client.config.FCAOPTION || {});
    client.callbacks.attach(api);
    loadPlugins(client, path.resolve(__dirname, '../plugins'));
    createListener({ api, client, callbackRegistry: client.callbacks })();
  });

  return true;
}

async function bootstrap() {
  const language = loadLanguage(config.LANGUAGE);
  const getText = createTranslator(language);
  
  const client = {
    config,
    language,
    getText,
    logger,
    commands: new Map(),
    events: [],
    callbacks: createCallbackRegistry(logger, getText),
  };

  await connectDatabase(client);
  startBot(client);
  return client;
}

module.exports = { bootstrap, startBot };
