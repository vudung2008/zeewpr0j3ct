module.exports = ({ api, event }) => {
	var type = event.type;
	for (var i = 0; i < global.client.events.length; i++) {
		if(type == global.client.events[i].type){
		global.client.events[i].run({ api: api, event: event });}
	}
}