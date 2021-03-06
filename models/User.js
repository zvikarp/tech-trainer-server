const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	accounts: {
		type: Object,
		default: {}
	},
	role: {
		type: String,
		default: 'user'
	},
	points: {
		type: Number,
		default: 0
	},
	bonusPoints: {
		type: Number,
		default: 0
	},
});

module.exports = User = mongoose.model("Users", UserSchema);