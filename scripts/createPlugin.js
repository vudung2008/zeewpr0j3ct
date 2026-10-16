#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('Usage: node scripts/createPlugin.js <pluginName> <type> [options]');
  console.error('Types: command, event, callback, full');
  console.error('Options: --admin, --description "...", --eventType <type>, --callbackType <type>');
  process.exit(1);
}

const pluginName = args[0];
const pluginType = args[1] || 'command';
const isAdmin = args.includes('--admin');
const descIdx = args.indexOf('--description');
const description = descIdx !== -1 ? args[descIdx + 1] : `${pluginName} plugin`;
const eventTypeIdx = args.indexOf('--eventType');
const eventType = eventTypeIdx !== -1 ? args[eventTypeIdx + 1] : 'message';
const callbackTypeIdx = args.indexOf('--callbackType');
const callbackType = callbackTypeIdx !== -1 ? args[callbackTypeIdx + 1] : 'reply';

const pluginPath = path.join(__dirname, '../plugins', `${pluginName}.js`);

if (fs.existsSync(pluginPath)) {
  console.error(`Plugin "${pluginName}" already exists!`);
  process.exit(1);
}

const templates = {
  command: `module.exports.config = {
  name: '${pluginName}',
  permission: ${isAdmin ? 1 : 0},
  description: '${description}',
  version: '1.0.0',
};

module.exports.setup = ({ api, client }) => {
  client.logger(\`Setup ${pluginName} command\`, 'info');
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, args, command } = context;

  try {
    api.sendMessage('${pluginName} command executed!', threadID);
  } catch (error) {
    api.sendMessage(\`Error: \${error.message}\`, threadID);
  }
};
`,
  event: `module.exports.config = {
  name: '${pluginName}',
  type: '${eventType}',
  description: '${description}',
  version: '1.0.0',
};

module.exports.event = ({ api, event }) => {
  try {
    if (event.type === '${eventType}') {
      // Handle event
      console.log('${pluginName} event triggered');
    }
  } catch (error) {
    console.error('${pluginName} error:', error.message);
  }
};
`,
  callback: `module.exports.config = {
  name: '${pluginName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID, senderID } = context;

  try {
    api.sendMessage('Send reply/reaction/unsend!', threadID, (error, info) => {
      if (error) return;

      api.handler${callbackType.charAt(0).toUpperCase() + callbackType.slice(1)}(info.messageID, ({ api, event }) => {
        api.sendMessage(\`${pluginName} callback triggered!\`, event.threadID);
      });
    });
  } catch (error) {
    api.sendMessage(\`Error: \${error.message}\`, threadID);
  }
};
`,
  full: `module.exports.config = {
  name: '${pluginName}',
  permission: ${isAdmin ? 1 : 0},
  description: '${description}',
  version: '1.0.0',
  type: '${eventType}',
};

module.exports.setup = ({ api, client }) => {
  client.logger(\`Setup ${pluginName} plugin\`, 'info');
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, args } = context;

  try {
    api.sendMessage('${pluginName} command executed!', threadID);
  } catch (error) {
    api.sendMessage(\`Error: \${error.message}\`, threadID);
  }
};

module.exports.event = ({ api, event }) => {
  try {
    if (event.type === '${eventType}') {
      console.log('${pluginName} event triggered');
    }
  } catch (error) {
    console.error('${pluginName} error:', error.message);
  }
};
`,
};

const template = templates[pluginType] || templates.command;
fs.writeFileSync(pluginPath, template);
console.log(`✓ Created ${pluginType} plugin: ${pluginPath}`);
