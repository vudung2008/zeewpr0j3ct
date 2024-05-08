const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Thread = new mongoose.Schema({
	threadID: Number,
	threadName: String,
	memberIDs: Array,
	adminIDs: Array,
	isGroup: Boolean,
	data: Object
});

Thread.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model("thread", Thread);