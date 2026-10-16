module.exports.config = {
  name: 'cmdhelp',
  permission: 0,
  description: 'View detailed command usage',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID, args, client } = context;

  const commandName = args[1];

  // If no command specified, show usage
  if (!commandName) {
    return api.sendMessageAsync(
      '📖 Command Help\n\n' +
      'Usage: !cmdhelp <command>\n' +
      'Example: !cmdhelp shop\n\n' +
      'Or use !help to browse all commands',
      threadID
    );
  }

  // Get command details
  const command = client.commands.get(commandName);

  if (!command) {
    return api.sendMessageAsync(
      `❌ Command "${commandName}" not found.\n\n` +
      'Use !help to see all available commands.',
      threadID
    );
  }

  // Build detailed help message
  let message = `📖 Command: !${command.config.name}\n\n`;

  if (command.config.description) {
    message += `📝 Description:\n${command.config.description}\n\n`;
  }

  message += `🔒 Permission: ${command.config.permission === 0 ? 'Public' : 'Admin only'}\n`;

  if (command.config.version) {
    message += `📦 Version: ${command.config.version}\n`;
  }

  // Add usage examples based on command type
  message += `\n💡 Usage:\n`;

  // Check if it's a workflow command
  const isWorkflow = client.commandRegistry && 
                     client.commandRegistry.workflows.has(commandName);

  if (isWorkflow) {
    message += `!${commandName} - Opens interactive menu\n`;
    message += `Reply with numbers or react to navigate\n`;
  } else {
    // Traditional command
    if (command.config.usage) {
      message += `!${commandName} ${command.config.usage}\n`;
    } else {
      message += `!${commandName} [arguments]\n`;
    }
  }

  // Add specific examples for known commands
  const examples = {
    ping: '!ping - Simple test command',
    shop: '!shop - Browse products\nReply with 1, 2, or 3 to select category',
    pizza: '!pizza - Order pizza\nNavigate through size and topping menus',
    game: '!game - Play mini games\nReact with emoji to choose game',
    settings: '!settings - Configure bot\nReact to enable/disable features',
    admin: '!admin - Admin panel (admin only)\nManage users and thread settings',
    apitest: '!apitest stats - View API statistics\n!apitest typing - Test typing indicator\n!apitest userinfo - Get your info',
    menu: '!menu reply - Reply-based menu example\n!menu reaction - Reaction-based menu\n!menu form - Form example',
  };

  if (examples[commandName]) {
    message += `\n📚 Examples:\n${examples[commandName]}`;
  }

  await api.sendMessageAsync(message, threadID);
};
