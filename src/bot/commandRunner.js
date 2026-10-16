function buildCommandContext({ api, event, command, args, client }) {
  // Store client reference in event for workflow access
  event._client = client;
  
  return {
    api,
    messageID: event.messageID,
    threadID: event.threadID,
    senderID: event.senderID,
    message: event,
    body: event.body,
    args,
    isGroup: !!event.isGroup,
    command,
    event,
    client,
  };
}

async function runCommand({ api, event, client }) {
  if (!event || !event.body) return;
  
  const prefix = client?.config?.PREFIX || '!';
  const message = String(event.body || '');
  if (!message.startsWith(prefix)) return;

  const args = message.slice(prefix.length).trim().split(/\s+/).filter(Boolean);
  if (!args.length) return;

  const commandName = args[0];
  const command = client?.commands?.get(commandName);
  if (!command) return;

  if (client.config.DEVMODE && !client.config.ADMINID.some((id) => String(id) === String(event.senderID))) {
    return;
  }

  const commandContext = buildCommandContext({ api, event, command, args, client });
  const permissionRequired = Number(command.config?.permission || 0);
  if (permissionRequired !== 0) {
    try {
      const info = await api.getThreadInfo(event.threadID);
      const adminIDs = Array.isArray(info?.adminIDs) ? info.adminIDs : [];
      const isAdmin = adminIDs.some((id) => String(id) === String(event.senderID)) || (client?.config?.ADMINID || []).some((id) => String(id) === String(event.senderID));
      if (!isAdmin) return;
    } catch (error) {
      client.logger(`Unable to check permissions for ${commandName}: ${error.message}`, 'error');
      return;
    }
  }

  try {
    await command.call(commandContext);
  } catch (error) {
    client.logger(`Command ${commandName} failed: ${error.stack || error.message}`, 'error');
  }
}

module.exports = { runCommand, buildCommandContext };
