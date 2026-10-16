const logger = require('../logger');

/**
 * API Wrapper - Enhanced API methods with error handling and utilities
 */
function createApiWrapper(rawApi, client) {
  const api = { ...rawApi };

  // Track API call stats
  const stats = {
    totalCalls: 0,
    errors: 0,
    startTime: Date.now(),
  };

  /**
   * Wrap API method with error handling and logging
   */
  function wrapMethod(methodName, originalMethod) {
    return function (...args) {
      stats.totalCalls++;
      
      // If last arg is callback, wrap it
      const lastArg = args[args.length - 1];
      if (typeof lastArg === 'function') {
        const originalCallback = lastArg;
        args[args.length - 1] = function (err, ...results) {
          if (err) {
            stats.errors++;
            client.logger(`API ${methodName} error: ${err.message || err}`, 'error');
          }
          return originalCallback(err, ...results);
        };
      }

      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        stats.errors++;
        client.logger(`API ${methodName} exception: ${error.message}`, 'error');
        throw error;
      }
    };
  }

  // Wrap common API methods
  const methodsToWrap = [
    'sendMessage',
    'sendTypingIndicator',
    'markAsRead',
    'setMessageReaction',
    'getUserInfo',
    'getThreadInfo',
    'changeNickname',
    'changeThreadColor',
    'changeThreadEmoji',
    'addUserToGroup',
    'removeUserFromGroup',
    'changeAdminStatus',
    'unsendMessage',
    'createPoll',
  ];

  methodsToWrap.forEach((method) => {
    if (api[method]) {
      api[method] = wrapMethod(method, api[method]);
    }
  });

  // Enhanced sendMessage with validation
  const originalSendMessage = api.sendMessage;
  api.sendMessage = function (message, threadID, callback, messageID) {
    if (!message || (typeof message === 'string' && !message.trim())) {
      const err = new Error('Message cannot be empty');
      if (typeof callback === 'function') {
        return callback(err);
      }
      throw err;
    }

    if (!threadID) {
      const err = new Error('ThreadID is required');
      if (typeof callback === 'function') {
        return callback(err);
      }
      throw err;
    }

    return originalSendMessage.call(this, message, threadID, callback, messageID);
  };

  // Promisified versions
  api.sendMessageAsync = function (message, threadID, messageID) {
    return new Promise((resolve, reject) => {
      api.sendMessage(message, threadID, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      }, messageID);
    });
  };

  api.getUserInfoAsync = function (userIDs) {
    return new Promise((resolve, reject) => {
      api.getUserInfo(userIDs, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      });
    });
  };

  api.getThreadInfoAsync = function (threadID) {
    return new Promise((resolve, reject) => {
      api.getThreadInfo(threadID, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      });
    });
  };

  api.markAsReadAsync = function (threadID) {
    return new Promise((resolve, reject) => {
      api.markAsRead(threadID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  api.setMessageReactionAsync = function (reaction, messageID, threadID) {
    return new Promise((resolve, reject) => {
      api.setMessageReaction(reaction, messageID, threadID, (err) => {
        if (err) return reject(err);
        resolve({ reaction, messageID, threadID });
      });
    });
  };

  api.unsendMessageAsync = function (messageID) {
    return new Promise((resolve, reject) => {
      api.unsendMessage(messageID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  api.changeThreadColorAsync = function (color, threadID) {
    return new Promise((resolve, reject) => {
      api.changeThreadColor(color, threadID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  api.changeThreadEmojiAsync = function (emoji, threadID) {
    return new Promise((resolve, reject) => {
      api.changeThreadEmoji(emoji, threadID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  api.addUserToGroupAsync = function (userID, threadID) {
    return new Promise((resolve, reject) => {
      api.addUserToGroup(userID, threadID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  api.removeUserFromGroupAsync = function (userID, threadID) {
    return new Promise((resolve, reject) => {
      api.removeUserFromGroup(userID, threadID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  api.changeAdminStatusAsync = function (threadID, adminIDs, adminStatus) {
    return new Promise((resolve, reject) => {
      api.changeAdminStatus(threadID, adminIDs, adminStatus, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  api.createPollAsync = function (title, threadID, options) {
    return new Promise((resolve, reject) => {
      api.createPoll(title, threadID, options, (err, poll) => {
        if (err) return reject(err);
        resolve(poll);
      });
    });
  };

  // Utility: Send typing indicator for duration
  api.sendTypingForDuration = function (threadID, duration = 3000) {
    api.sendTypingIndicator(threadID, (err) => {
      if (err) client.logger(`Typing indicator error: ${err.message}`, 'error');
    });
    
    if (duration > 0) {
      setTimeout(() => {
        api.sendTypingIndicator(threadID, () => {}, true);
      }, duration);
    }
  };

  // Utility: Send message with typing indicator
  api.sendMessageWithTyping = async function (message, threadID, typingDuration = 1000) {
    api.sendTypingForDuration(threadID, typingDuration);
    await new Promise(resolve => setTimeout(resolve, typingDuration));
    return api.sendMessageAsync(message, threadID);
  };

  // Utility: Reply to message
  api.reply = function (message, threadID, messageID, callback) {
    return api.sendMessage(
      { body: message },
      threadID,
      callback,
      messageID
    );
  };

  api.replyAsync = function (message, threadID, messageID) {
    return new Promise((resolve, reject) => {
      api.reply(message, threadID, messageID, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      });
    });
  };

  // Utility: Get API stats
  api.getStats = function () {
    return {
      ...stats,
      uptime: Date.now() - stats.startTime,
      errorRate: stats.totalCalls > 0 ? (stats.errors / stats.totalCalls * 100).toFixed(2) + '%' : '0%',
    };
  };

  // Utility: Check if user is admin in thread
  api.isUserAdmin = async function (userID, threadID) {
    try {
      const info = await api.getThreadInfoAsync(threadID);
      const adminIDs = Array.isArray(info?.adminIDs) ? info.adminIDs : [];
      return adminIDs.some(id => String(id) === String(userID));
    } catch (error) {
      client.logger(`isUserAdmin error: ${error.message}`, 'error');
      return false;
    }
  };

  // Utility: Check if bot is admin in thread
  api.isBotAdmin = async function (threadID) {
    const botID = api.getCurrentUserID();
    return api.isUserAdmin(botID, threadID);
  };

  return api;
}

module.exports = { createApiWrapper };
