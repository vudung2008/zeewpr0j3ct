const fs = require('fs');
const path = require('path');

function loadLanguage(languageName, languageDir = path.resolve(__dirname, '../lang')) {
  const target = path.join(languageDir, `${languageName || 'en'}.lang`);
  const fallback = path.join(languageDir, 'en.lang');
  const filePath = fs.existsSync(target) ? target : fallback;
  const language = {};

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n|\r/)) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    language[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return language;
}

function createTranslator(language) {
  return (key, ...args) => {
    if (!Object.prototype.hasOwnProperty.call(language, key)) {
      throw new Error(`Not found key language: ${key}`);
    }

    return args.reduce(
      (text, value, index) => text.replace(`$${index + 1}`, String(value)),
      language[key],
    );
  };
}

module.exports = { loadLanguage, createTranslator };
