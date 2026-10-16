module.exports.config = {
  name: 'apitest',
  permission: 0,
  description: 'Test enhanced API methods',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, args } = context;

  try {
    const action = args[1] || 'help';

    switch (action) {
      case 'stats':
        // Get API stats
        const stats = api.getStats();
        await api.sendMessageAsync(
          `📊 API Statistics:\n` +
          `Total calls: ${stats.totalCalls}\n` +
          `Errors: ${stats.errors}\n` +
          `Error rate: ${stats.errorRate}\n` +
          `Uptime: ${Math.floor(stats.uptime / 1000)}s`,
          threadID
        );
        break;

      case 'typing':
        // Send message with typing indicator
        await api.sendMessageWithTyping('Typing for 2 seconds...', threadID, 2000);
        break;

      case 'react':
        const result = await api.setMessageReactionAsync('👍', context.messageID, threadID);
        await api.sendMessageAsync(`Reacted with 👍 to message ${result.messageID}`, threadID);
        break;

      case 'userinfo':
        // Get user info (promisified)
        const userInfo = await api.getUserInfoAsync(senderID);
        const user = userInfo[senderID];
        await api.sendMessageAsync(
          `👤 User Info:\n` +
          `Name: ${user.name}\n` +
          `Gender: ${user.gender || 'N/A'}`,
          threadID
        );
        break;

      case 'threadinfo':
        // Get thread info (promisified)
        const threadInfo = await api.getThreadInfoAsync(threadID);
        await api.sendMessageAsync(
          `💬 Thread Info:\n` +
          `Name: ${threadInfo.threadName || 'N/A'}\n` +
          `Members: ${threadInfo.participantIDs?.length || 0}\n` +
          `Admins: ${threadInfo.adminIDs?.length || 0}`,
          threadID
        );
        break;

      case 'isadmin':
        // Check if user is admin
        const isAdmin = await api.isUserAdmin(senderID, threadID);
        await api.sendMessageAsync(
          isAdmin ? 'You are an admin!' : 'You are not an admin',
          threadID
        );
        break;

      case 'botadmin':
        // Check if bot is admin
        const isBotAdmin = await api.isBotAdmin(threadID);
        await api.sendMessageAsync(
          isBotAdmin ? 'Bot is an admin!' : 'Bot is not an admin',
          threadID
        );
        break;

      default:
        await api.sendMessageAsync(
          '🔧 API Test Commands:\n' +
          '!apitest stats - View API statistics\n' +
          '!apitest typing - Test typing indicator\n' +
          '!apitest react - React to your message\n' +
          '!apitest userinfo - Get your info\n' +
          '!apitest threadinfo - Get thread info\n' +
          '!apitest isadmin - Check if you are admin\n' +
          '!apitest botadmin - Check if bot is admin',
          threadID
        );
    }
  } catch (error) {
    await api.sendMessageAsync(`Error: ${error.message}`, threadID);
  }
};
