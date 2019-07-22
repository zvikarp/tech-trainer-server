const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
	userId: {
		type: String,
		required: true
	},
	history: {
			timestamp: Date,
			points: Number,
			accounts: Schema.Types.Mixed
		},
});
module.exports = History = mongoose.model("History", HistorySchema);