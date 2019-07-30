const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChartSchema = new Schema({
	// TODO: specify types
	top3: {},
	passed: {},
	under: {},
	lastUpdated: {},
});

module.exports = Chart = mongoose.model("Chart", ChartSchema);