const consts = require("../../consts/consts");
const resData = require("../../consts/resData");
const Chart = require("../../models/Chart");
const HttpStatus = require("http-status-codes");

function getLast() {
	return Chart.findOne({ $query: {}, $orderby: { $timestamp: -1 } })
		.then(chart => {
			return chart;
		})
		.catch(err => documentNotFound());
}

function putLast(chart) {
	
	return Chart.findOneAndUpdate(
		{}, 
		{ $set: { chart } },
		{ upsert: true, sort: { timestamp: -1 } })
		.then(chart => {
			console.log(chart);
			return true;
		})
		.catch(err => documentNotFound());
}

function post(chart) {
	return chart.save();
}

function documentNotFound() {
	throw {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.DOCUMENT_NOT_FOUND
	};
}

module.exports = { getLast, putLast, post };
