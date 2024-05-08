const { readFileSync, existsSync } = require('fs');
const logger = require("./utils/log");
const { onBot, loadPlugin, loadModels, conDB } = require("./core/main");

global.client = {
    config: new Object(),
    language: new Object()
};

global.client.config = JSON.parse(readFileSync('./config/main.config.json'));
var langText;
if(!existsSync(`./lang/${client.config.LANGUAGE}.lang`)) langText = readFileSync(`${__dirname}\\lang\\en.lang`,'utf-8').split(/\r?\n|\r/);
else langText = readFileSync(`${__dirname}\\lang\\${global.client.config.LANGUAGE || 'en'}.lang`,'utf-8').split(/\r?\n|\r/);
var langData = langText.filter(item => item.charAt(0) != '#' && item != '');
for (var i = 0; i < langData.length; i++) {
    const j = langData[i].indexOf('=');
    if(j>0){
        const key = langData[i].substring(j,0).trim();
        const value = langData[i].substring(j+1).trim();

        global.client.language[key] = value;
    }
}

global.getText = function (...args) {
    const lang = global.client.language;
    if(!lang.hasOwnProperty(args[0])) throw `Not found key language: ${args[0]}`;
    var text = lang[args[0]];
    for (var i = 1; i <= args.length -1 ; i++) {
        text = text.replace(`\$${i}`,args[i]);
    }
    return text;
}

if(!existsSync(client.config.APPSTATEPATH)) return logger(global.getText('notFoundAppstate'), 'error');
logger(global.getText('foundAppstate'), 'success')
global.client.handlerReply = (messageID, callback) => {
    messageID = String(messageID);
    if(typeof(callback) != 'function') return logger(global.getText('errorCallback'), 'error');
    global.client.listReply.set(messageID, callback);
};
global.client.handlerReaction = (messageID, callback) => {
    messageID = String(messageID);
    if(typeof(callback) != 'function') return logger(global.getText('errorCallback'), 'error');
    global.client.listReaction.set(messageID, callback);
};
global.client.handlerUnsend = (messageID, callback) => {
    messageID = String(messageID);
    if(typeof(callback) != 'function') return logger(global.getText('errorCallback'), 'error');
    global.client.listUnsend.set(messageID, callback);
};
global.client.logger = logger;
loadPlugin();
conDB(client.config.MongoDB)
loadModels();
onBot(client.config.APPSTATEPATH);
