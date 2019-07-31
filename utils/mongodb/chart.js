const documents = require("../../consts/documents");
const messages = require("../../consts/messages");
const Chart = require("../../models/Chart");
const HttpStatus = require("http-status-codes");

function get() {
	return Chart.findById(documents.CHART)
		.then(chart => {
			return chart;
		})
		.catch(err => documentNotFound());
}

function put(top3, passed, under) {
	return Chart.findOneAndUpdate(
		{ _id: documents.CHART },
		{
			$set: {
				top3: top3,
				passed: passed,
				under: under,
				lastUpdated: Date.now()
			}
		},
		{ upsert: true }
	)
		.then(chart => {
			return true;
		})
		.catch(err => documentNotFound());
}

function documentNotFound() {
	throw new Error({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: messages.DOCUMENT_NOT_FOUND
	});
}

module.exports = { get, put };
