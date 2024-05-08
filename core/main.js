const login = require('facebook-chat-api');
const { readFileSync, readdirSync } = require('fs');
const logger = require("../utils/log");

function onBot(appstate) {
    login({ appState: JSON.parse(readFileSync(appstate)) }, (err, api) => {
        if(err) return logger(JSON.stringify(err), 'error');
        api.handlerReply = global.client.handlerReply;
        api.handlerReaction = global.client.handlerReaction;
        api.handlerUnsend = global.client.handlerUnsend;

        global.api = api
        api.setOptions(global.client.config.FCAOPTION);
        require(__dirname + '/listen')({ api });
    })    
}

function loadModels() {
    const Thread = require('./models/thread');
    const User = require('./models/user');
    async function createThread(a) {
        var data = await Thread.findOne({ threadID: a.threadID })
        if(!data) {
            const newThread = new Thread(a);
            await newThread.save();
            console.log('newThread: '+a.threadID);
        }
        else {
            data.threadName = a.threadName
            data.memberIDs = a.memberIDs
            data.adminIDs = a.adminIDs
            data.isGroup = a.isGroup
            data.data = a.data
            await data.save();
            console.log('updateThread: '+a.userID);
        }
    }
    async function createUser(a) {
        var data = await User.findOne({ userID: a.userID })
        if(!data) {
            const newUser = new User(a);
            await newUser.save();
            console.log('newUser: '+a.userID);
        }
        else {
            data.name = a.name
            data.vantiny = a.vantiny
            data.gender = a.gender
            data.isBirthday = a.isBirthday
            data.data = a.data
            await data.save();
            console.log('updateUser: '+a.userID);
        }
    }
    logger(global.getText('successLoadModels'), 'success');
    global.client.models = new Object();
    global.client.models.createThread = createThread;
    global.client.models.createUser = createUser;
    global.client.models.User = User;
    global.client.models.Thread = Thread;
}

async function conDB(url) {
    const mongoose = require("mongoose");
    await mongoose.connect(url);
    logger(global.getText('successConnectDB'), "success");
}
    

function loadPlugin() {
    global.client.commands = new Map();
    global.client.events = new Array();
    global.client.listReply = new Map();
    global.client.listUnsend = new Map();
    global.client.listReaction = new Map();
    listPlugin = readdirSync(__dirname + '/../plugins').filter(file => file.endsWith('.js') && !file.includes('example'));
    for (const file of listPlugin) {
        try {
            plugin = require(__dirname + '/../plugins/' + file);
            if(!plugin.config) continue;
            if(!plugin.config.name) continue;
            if(plugin.setup) {
                try {
                    plugin.setup({ api: global.api, client: global.client })
                }
                catch {
                    logger(global.getText('errorSetup', plugin.config.name), 'error');
                }
            }
            if(plugin.call) {
                if(global.client.commands.has(plugin.config.name)) continue;
                global.client.commands.set(plugin.config.name, plugin);
            }
            if(plugin.event) {
                if(!plugin.config.type) continue;
                global.client.events[global.client.events.length] = { type: plugin.config.type, run: plugin.event };
            }
        }
        catch {

        }
    }
    logger(global.getText('loadPlugin', global.client.commands.size), 'success')
}

module.exports = { onBot, loadPlugin, loadModels, conDB }