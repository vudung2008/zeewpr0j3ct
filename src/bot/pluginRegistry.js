const fs = require('fs');
const path = require('path');

function loadPlugins(client, pluginDir = path.resolve(__dirname, '../../plugins')) {
  const files = fs.readdirSync(pluginDir)
    .filter((file) => file.endsWith('.js') && !file.includes('example'));

  client.commands = new Map();
  client.events = [];
  client.listReply = new Map();
  client.listUnsend = new Map();
  client.listReaction = new Map();

  for (const file of files) {
    try {
      const plugin = require(path.join(pluginDir, file));
      if (!plugin || !plugin.config || !plugin.config.name) {
        client.logger(client.getText('loadPlugin', file), 'warn');
        continue;
      }

      if (plugin.setup) {
        try {
          plugin.setup({ api: client.api, client });
        } catch (error) {
          client.logger(client.getText('errorSetup', plugin.config.name), 'error');
        }
      }

      if (plugin.call && !client.commands.has(plugin.config.name)) {
        client.commands.set(plugin.config.name, plugin);
      }

      if (plugin.event && plugin.config.type) {
        client.events.push({ type: plugin.config.type, run: plugin.event });
      }
    } catch (error) {
      client.logger(`Failed to load plugin ${file}: ${error.stack || error.message}`, 'error');
    }
  }

  client.logger(`Loaded ${client.commands.size} plugin(s)!`, 'success');
  return client;
}

module.exports = { loadPlugins };
