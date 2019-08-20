const resData = require("../../consts/resData");
const Chart = require("../../models/Chart");
const HttpStatus = require("http-status-codes");

// TODO: Better return values, on success and error also in other routes.

function getLast() {
	return Chart.findOne({ $query: {}, $orderby: { $timestamp: -1 } })
		.then(chart => {
			return chart;
		})
		.catch(err => documentNotFound());
}

function get() {
	return Chart.find({ $query: {}, $orderby: { $timestamp: -1 } }).limit(25)
		.then(chart => {
			return chart;
		})
		.catch(err => documentNotFound());
}

function putLast(chart) {
	return Chart.findOneAndUpdate(
		{}, { $set: { timestamp: chart.timestamp, users: chart.users }, $orderby: { $timestamp: -1 } }
	).then(chart => chart)
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

module.exports = { get, getLast, putLast, post };
