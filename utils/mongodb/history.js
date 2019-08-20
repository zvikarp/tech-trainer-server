const resData = require("../../consts/resData");
const History = require("../../models/History");
const HttpStatus = require('http-status-codes');

function getByUserId(userId) {
	return History.find({ userId: userId }).sort({ timestamp: 'desc' }).then(historyArray => {
		return historyArray;
	}).catch(err => documentNotFound());
}

function post(history) {
	return history.save();
}

function putInLastByUserId(history) {
	return History.findOneAndUpdate(
		{ userId: history.userId }, { $set: { history }, $orderby: { $timestamp: -1 } }
	).then(history => history)
		.catch(err => documentNotFound());
}

function documentNotFound() {
	throw {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.DOCUMENT_NOT_FOUND,
	};
}

module.exports = { getByUserId, post, putInLastByUserId };