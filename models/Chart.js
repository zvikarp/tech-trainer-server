const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ChartSchema = new Schema({
	top3: {
	},
	passed: {
	},
	under: {
	},
	lastUpdated: {
	},
});
module.exports = Chart = mongoose.model("Chart", ChartSchema);