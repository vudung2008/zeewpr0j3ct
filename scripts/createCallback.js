#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('Usage: node scripts/createCallback.js <callbackName> <callbackType> [--description "..."]');
  console.error('Callback types: reply, reaction, unsend');
  process.exit(1);
}

const callbackName = args[0];
const callbackType = args[1] || 'reply';
const descIdx = args.indexOf('--description');
const description = descIdx !== -1 ? args[descIdx + 1] : `${callbackName} callback handler`;

if (!['reply', 'reaction', 'unsend'].includes(callbackType)) {
  console.error('Invalid callback type. Must be: reply, reaction, unsend');
  process.exit(1);
}

const pluginPath = path.join(__dirname, '../plugins', `${callbackName}.js`);

if (fs.existsSync(pluginPath)) {
  console.error(`Callback "${callbackName}" already exists!`);
  process.exit(1);
}

const templates = {
  reply: `module.exports.config = {
  name: '${callbackName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, messageID } = context;

  try {
    // Send a message that expects a reply callback
    api.sendMessage('Reply to this message!', threadID, (error, info) => {
      if (error) {
        api.sendMessage(\`Error: \${error.message}\`, threadID);
        return;
      }

      // Register callback for reply to this message
      api.handlerReply(info.messageID, ({ api, event }) => {
        api.sendMessage(
          \`You replied: \${event.body}\`,
          event.threadID,
          event.messageID
        );
      });
    });
  } catch (error) {
    api.sendMessage(\`Error: \${error.message}\`, threadID);
  }
};
`,
  reaction: `module.exports.config = {
  name: '${callbackName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, messageID } = context;

  try {
    // Send a message that expects reaction callback
    api.sendMessage('React to this message!', threadID, (error, info) => {
      if (error) {
        api.sendMessage(\`Error: \${error.message}\`, threadID);
        return;
      }

      // Register callback for reaction to this message
      api.handlerReaction(info.messageID, ({ api, event }) => {
        api.sendMessage(
          \`You reacted with: \${event.reaction}\`,
          event.threadID,
          event.messageID
        );
      });
    });
  } catch (error) {
    api.sendMessage(\`Error: \${error.message}\`, threadID);
  }
};
`,
  unsend: `module.exports.config = {
  name: '${callbackName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, messageID } = context;

  try {
    // Send a message that expects unsend callback
    api.sendMessage('Try to unsend this message!', threadID, (error, info) => {
      if (error) {
        api.sendMessage(\`Error: \${error.message}\`, threadID);
        return;
      }

      // Register callback for unsend of this message
      api.handlerUnsend(info.messageID, ({ api, event }) => {
        api.sendMessage(
          \`Message was unsent\`,
          event.threadID,
          event.messageID
        );
      });
    });
  } catch (error) {
    api.sendMessage(\`Error: \${error.message}\`, threadID);
  }
};
`,
};

const template = templates[callbackType];
fs.writeFileSync(pluginPath, template);
console.log(`✓ Created callback: ${pluginPath}`);
