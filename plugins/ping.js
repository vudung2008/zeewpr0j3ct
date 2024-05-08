module.exports.config = {
	name: 'ping',
	version: '1.0.0',
	description: 'Pong!',
	type: '',
	usage: '[]',
	type: 'message',
	permission: 0
}

module.exports.setup = ({ api, client,  }) => {

}

module.exports.call = async ({ api, messageID,  threadID, senderID, message, body, args, isGroup}) => {
	a = await global.client.models.Thread.findOne({ threadID: 1 })
	console.log(a)
}

module.exports.event = ({ api, event }) => {
	api.handlerUnsend(event.messageID, ({ api, event }) => {console.log('h')})
}