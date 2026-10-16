module.exports.config = {
  name: 'ping',
  version: '1.0.0',
  description: 'Pong!',
  usage: '[]',
  type: 'message',
  permission: 0,
};

module.exports.setup = ({ api, client }) => {
  // no-op
};

module.exports.call = async ({ api, threadID, messageID }) => {
  api.sendMessage('Pong!', threadID, messageID);
};

module.exports.event = ({ api, event }) => {
  if (!event || !event.messageID) return;
};