const test = require('node:test');
const assert = require('node:assert/strict');
const { createCallbackRegistry } = require('../src/bot/callbackRegistry');

test('callback registry invokes and removes a reply callback', () => {
  const errors = [];
  const registry = createCallbackRegistry((message) => errors.push(message));
  let received;

  registry.handle('reply', 'missing', {});
  registry.registries.reply.set('message-1', (context) => { received = context; });
  registry.handle('reply', 'message-1', { value: 42 });

  assert.deepEqual(received, { value: 42 });
  assert.equal(registry.registries.reply.has('message-1'), false);
  assert.deepEqual(errors, []);
});

test('callback registry logs callback failures', () => {
  const errors = [];
  const registry = createCallbackRegistry((message, level) => errors.push({ message, level }));
  registry.registries.unsend.set('message-1', () => { throw new Error('broken'); });

  registry.handle('unsend', 'message-1', {});

  assert.equal(errors.length, 1);
  assert.equal(errors[0].level, 'error');
});
