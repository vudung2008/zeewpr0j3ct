function createHandlers(callbackRegistry) {
  return {
    message_reply({ api, event }) {
      if (event?.messageReply?.messageID) {
        callbackRegistry.handle('reply', event.messageReply.messageID, { api, event });
      }
    },

    message_reaction({ api, event }) {
      if (event?.messageID) {
        callbackRegistry.handle('reaction', event.messageID, { api, event });
      }
    },

    message_unsend({ api, event }) {
      if (event?.messageID) {
        callbackRegistry.handle('unsend', event.messageID, { api, event });
      }
    },
  };
}

module.exports = { createHandlers };
