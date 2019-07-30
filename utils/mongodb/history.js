const messages = require("../../consts/messages");
const History = require("../../models/History");
const HttpStatus = require('http-status-codes');

function getByUserId(userId) {
	return History.find({ userId: userId }).sort({ timestamp: 'desc' }).then(historyArray => {
		return historyArray;
	}).catch(err => documentNotFound());
}

function documentNotFound() {
	throw new Error({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: messages.DOCUMENT_NOT_FOUND,
	});
}

module.exports = { getByUserId };