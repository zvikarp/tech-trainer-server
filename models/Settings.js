const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
	accounts: Schema.Types.Mixed,
	passing: {
		type: Number,
		default: 50
	},
});

module.exports = Settings = mongoose.model("Settings", SettingsSchema);