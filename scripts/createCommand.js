#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('Usage: node scripts/createCommand.js <commandName> [--admin] [--description "..."]');
  process.exit(1);
}

const commandName = args[0];
const isAdmin = args.includes('--admin');
const descIdx = args.indexOf('--description');
const description = descIdx !== -1 ? args[descIdx + 1] : `${commandName} command`;

const pluginPath = path.join(__dirname, '../plugins', `${commandName}.js`);

if (fs.existsSync(pluginPath)) {
  console.error(`Command "${commandName}" already exists!`);
  process.exit(1);
}

const template = `module.exports.config = {
  name: '${commandName}',
  permission: ${isAdmin ? 1 : 0},
  description: '${description}',
  version: '1.0.0',
};

module.exports.setup = ({ api, client }) => {
  client.logger(\`Setup ${commandName} command\`, 'info');
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, args } = context;

  try {
    api.sendMessage('${commandName} executed!', threadID);
  } catch (error) {
    api.sendMessage(\`Error: \${error.message}\`, threadID);
  }
};
`;

fs.writeFileSync(pluginPath, template);
console.log(`✓ Created command: ${pluginPath}`);
