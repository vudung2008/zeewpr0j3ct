const fs = require('fs');
const path = require('path');
require('dotenv').config();

function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`[ WARN ] » Unable to load config file ${filePath}: ${error.message}`);
    return {};
  }
}

function parseList(value) {
  if (Array.isArray(value)) return value.map(String);
  if (!value) return [];
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map(String);
  }
  return [String(value)];
}

function parseFcaOption(value, fallback = {}) {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn(`[ WARN ] » Invalid FCAOPTION JSON: ${error.message}`);
      return fallback;
    }

  }
  return fallback;
}

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

const defaultConfig = readJson(path.resolve(__dirname, '../config/main.config.json'));

const config = {
  DEVMODE: parseBoolean(process.env.DEVMODE, Boolean(defaultConfig.DEVMODE)),
  APPSTATEPATH: process.env.APPSTATEPATH || defaultConfig.APPSTATEPATH || 'appstate.json',
  PREFIX: process.env.PREFIX || defaultConfig.PREFIX || '!',
  LANGUAGE: process.env.LANGUAGE || defaultConfig.LANGUAGE || 'vi',
  FCAOPTION: parseFcaOption(process.env.FCAOPTION, defaultConfig.FCAOPTION || {
    selfListen: true,
    listenEvents: true,
    updatePresence: false,
    forceLogin: false,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',
    autoMarkDelivery: true,
    autoMarkRead: false,
  }),
  MongoDB: process.env.MONGODB_URI || process.env.MongoDB || defaultConfig.MongoDB || '',
  ADMINID: parseList(process.env.ADMINID || defaultConfig.ADMINID || []),
};

module.exports = config;
