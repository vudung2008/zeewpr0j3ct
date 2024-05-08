module.exports = ({ api, event }) => {
	global.client.listUnsend.forEach((values, keys) => {
    	if(keys == event.messageID) {
    		values( { api, event } )
    		global.client.listUnsend.delete(event.messageID);
    	}
})
}