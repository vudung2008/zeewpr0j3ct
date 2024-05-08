module.exports = async ({ api, event }) => {

	function check_arr(element,arr){
	    for (var i = 0; i < arr.length; i++) {
	    	if (arr[i] == element) return true;
	    }
	    return false;
	}

	if(global.client.config.DEVMODE && !check_arr(event.senderID, global.client.config.ADMINID)) return;
	var message = event.body;
	if(!message.startsWith(global.client.config.PREFIX)) return;
	var args = message.slice(global.client.config.PREFIX.length).trim().split(' ');

	if(!global.client.commands.has(args[0])) return;
	cc = { api: api, messageID: event.messageID,  threadID: event.threadID, senderID: event.senderID, message: event, body: event.body, args: args, isGroup: event.isGroup};
	await api.getThreadInfo(event.threadID , (err, info) => {
		var lstad = info.adminIDs;
		logic = lstad.includes(event.senderID) || check_arr(event.senderID, global.client.config.ADMINID)
		if (global.client.commands.get(args[0]).config.permission != 0) {
			if(!logic) return;
			global.client.commands.get(args[0]).call(cc)
		}
		else global.client.commands.get(args[0]).call(cc)
	})
}