module.exports = ({ api, event }) => {
	global.client.listReply.forEach((values, keys) => {
    	if(keys == event.messageReply.messageID) {
    		values( { api, event } )
    		global.client.listReply.delete(event.messageID)
    	}
})
}