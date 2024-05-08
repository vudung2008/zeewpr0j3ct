module.exports = ({ api, event }) => {
	global.client.listReaction.forEach((values, keys) => {
    	if(keys == event.messageID) {
    		values( { api, event } )
    		global.client.listReaction.delete(event.messageID)
    	}
})
}