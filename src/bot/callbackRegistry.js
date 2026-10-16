function createCallbackRegistry(logger, getText) {
  const registries = {
    reply: new Map(),
    reaction: new Map(),
    unsend: new Map(),
  };

  function register(type, messageID, callback) {
    if (typeof callback !== 'function') {
      logger(getText('errorCallback'), 'error');
      return;
    }
    registries[type].set(String(messageID), callback);
  }

  function attach(api) {
    api.handlerReply = (messageID, callback) => register('reply', messageID, callback);
    api.handlerReaction = (messageID, callback) => register('reaction', messageID, callback);
    api.handlerUnsend = (messageID, callback) => register('unsend', messageID, callback);
  }

  function handle(type, messageID, context) {
    const key = String(messageID || '');
    const callback = registries[type].get(key);
    if (!callback) return;

    registries[type].delete(key);
    try {
      callback(context);
    } catch (error) {
      logger(`Callback failed: ${error.stack || error.message}`, 'error');
    }
  }

  return { attach, handle, registries };
}

module.exports = { createCallbackRegistry };
