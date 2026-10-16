const test = require('node:test');
const assert = require('node:assert/strict');
const { createTranslator } = require('../src/i18n');

test('translator replaces positional placeholders', () => {
  const translate = createTranslator({ greeting: 'Hello $1, welcome to $2!' });
  assert.equal(translate('greeting', 'Ada', 'the bot'), 'Hello Ada, welcome to the bot!');
});

test('translator reports missing keys', () => {
  const translate = createTranslator({});
  assert.throws(() => translate('missing'), /Not found key language/);
});
