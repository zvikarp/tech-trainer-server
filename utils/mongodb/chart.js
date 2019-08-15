const consts = require("../../consts/consts");
const resData = require("../../consts/resData");
const Chart = require("../../models/Chart");
const HttpStatus = require("http-status-codes");

function get() {
	return Chart.findById(consts.CHART_DOCUMENT)
		.then(chart => {
			return chart;
		})
		.catch(err => documentNotFound());
}

function post(chart) {
	return Chart.findOneAndUpdate(
		{ _id: consts.CHART_DOCUMENT },
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
	throw {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.DOCUMENT_NOT_FOUND
	};
}

module.exports = { get, put };
