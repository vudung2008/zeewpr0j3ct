const logger = require("../utils/log");

module.exports = ({ api }) => {
    api.listenMqtt((err, event) => {
        //console.log(event);
        if(err) return logger(global.getText('errorListen', err), 'error');

            switch (event.type) {
            case 'message': 
                require(__dirname + '/handler/handlerCommand')({ api, event })
                break;
            case 'message_unsend':
                require(__dirname + '/handler/handlerUnsend')({ api, event });
                break;
            case 'message_reaction':
                require(__dirname + '/handler/handlerReaction')({ api, event });
                break;
            case 'message_reply':
                require(__dirname + '/handler/handlerReply')({ api, event });
                break;
            default:
                break;
        }
        require(__dirname + '/handler/handlerEvent')({ api, event })
    })
}