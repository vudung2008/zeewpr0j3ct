const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const User = new mongoose.Schema({
	userID: Number,
	name: String,
	vantiny: String,
	gender: Number,
	isBirthday: Boolean,
	data: Object
});

User.plugin(AutoIncrement, { inc_field: 'ID' });

module.exports = mongoose.model("user", User);