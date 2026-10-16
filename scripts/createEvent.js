#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('Usage: node scripts/createEvent.js <eventName> <eventType> [--description "..."]');
  console.error('Event types: message, message_reply, message_reaction, message_unsend, etc.');
  process.exit(1);
}

const eventName = args[0];
const eventType = args[1] || 'message';
const descIdx = args.indexOf('--description');
const description = descIdx !== -1 ? args[descIdx + 1] : `${eventName} event listener`;

const pluginPath = path.join(__dirname, '../plugins', `${eventName}.js`);

if (fs.existsSync(pluginPath)) {
  console.error(`Event "${eventName}" already exists!`);
  process.exit(1);
}

const template = `module.exports.config = {
  name: '${eventName}',
  type: '${eventType}',
  description: '${description}',
  version: '1.0.0',
};

module.exports.event = ({ api, event }) => {
  try {
    // Event data available in 'event' object
    // For 'message': event.type, event.senderID, event.threadID, event.body
    // For 'message_reply': event.messageReply, event.messageID
    // For 'message_reaction': event.reaction, event.messageID
    // For 'message_unsend': event.messageID

    if (event.type === '${eventType}') {
      // Handle ${eventType} event
      console.log('${eventName} triggered:', event);
    }
  } catch (error) {
    console.error('${eventName} error:', error.message);
  }
};
`;

fs.writeFileSync(pluginPath, template);
console.log(`✓ Created event: ${pluginPath}`);
