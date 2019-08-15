const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChartSchema = new Schema({
	// TODO: specify types
	users: Schema.Types.Mixed,
	timestamp: Date,
});

module.exports = Chart = mongoose.model("Chart", ChartSchema);