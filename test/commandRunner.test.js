const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCommandContext, runCommand } = require('../src/bot/commandRunner');

test('buildCommandContext preserves parsed command arguments', () => {
  const event = {
    body: '!ping hello world',
    messageID: 'message-1',
    threadID: 'thread-1',
    senderID: 'user-1',
    isGroup: true,
  };
  const command = { config: { name: 'ping' } };
  const context = buildCommandContext({
    api: {},
    event,
    command,
    args: ['ping', 'hello', 'world'],
  });

  assert.deepEqual(context.args, ['ping', 'hello', 'world']);
  assert.equal(context.isGroup, true);
});

test('runCommand calls a public command without thread lookup', async () => {
  let received;
  const client = {
    config: { PREFIX: '!', DEVMODE: false, ADMINID: [] },
    commands: new Map([[
      'ping',
      {
        config: { permission: 0 },
        call: async (context) => { received = context; },
      },
    ]]),
    logger: () => {},
  };

  await runCommand({
    api: { getThreadInfo: async () => { throw new Error('should not run'); } },
    client,
    event: { body: '!ping test', messageID: 'm', threadID: 't', senderID: 'u' },
  });

  assert.deepEqual(received.args, ['ping', 'test']);
});

test('runCommand blocks non-admin protected commands', async () => {
  let called = false;
  const client = {
    config: { PREFIX: '!', DEVMODE: false, ADMINID: [] },
    commands: new Map([[
      'secure',
      {
        config: { permission: 1 },
        call: async () => { called = true; },
      },
    ]]),
    logger: () => {},
  };

  await runCommand({
    api: { getThreadInfo: async () => ({ adminIDs: ['other-user'] }) },
    client,
    event: { body: '!secure', messageID: 'm', threadID: 't', senderID: 'u' },
  });

  assert.equal(called, false);
});
