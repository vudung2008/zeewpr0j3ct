#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('Usage: node scripts/createLanguage.js <languageCode>');
  console.error('Example: node scripts/createLanguage.js es (for Spanish)');
  process.exit(1);
}

const langCode = args[0];
const langDir = path.join(__dirname, '../lang');
const langPath = path.join(langDir, `${langCode}.lang`);

if (!fs.existsSync(langDir)) {
  fs.mkdirSync(langDir, { recursive: true });
}

if (fs.existsSync(langPath)) {
  console.error(`Language "${langCode}" already exists!`);
  process.exit(1);
}

// Read existing English language file to get keys
const enPath = path.join(langDir, 'en.lang');
let keys = [];

if (fs.existsSync(enPath)) {
  const enContent = fs.readFileSync(enPath, 'utf8');
  keys = enContent
    .split(/\r?\n|\r/)
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim());
}

let template = `# Language file: ${langCode}.lang
# Translate values after the = sign
# Keep keys unchanged

`;

if (keys.length > 0) {
  template += keys.map(key => `${key}=[TRANSLATE ME]\n`).join('');
} else {
  template += `# Add key-value pairs in format: key=value
notFoundAppstate=[TRANSLATE ME]
errorLoadEvent=[TRANSLATE ME]
errorLoadCommand=[TRANSLATE ME]
loadCommandSuccess=[TRANSLATE ME]
loadEventSuccess=[TRANSLATE ME]
errorListen=[TRANSLATE ME]
loadPluginSuccess=[TRANSLATE ME]
errorSetup=[TRANSLATE ME]
loadPlugin=[TRANSLATE ME]
errorCallback=[TRANSLATE ME]
successConnectDB=[TRANSLATE ME]
successLoadModels=[TRANSLATE ME]
`;
}

fs.writeFileSync(langPath, template);
console.log(`✓ Created language file: ${langPath}`);
console.log(`✓ Translate keys marked with [TRANSLATE ME]`);
