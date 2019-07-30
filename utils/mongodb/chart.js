const documents = require("../../consts/documents");
const messages = require("../../consts/messages");
const Chart = require("../../models/Chart");
const HttpStatus = require('http-status-codes');

function get() {
	return Chart.findById(documents.CHART).then(settings => {
		return settings;
	}).catch(err => documentNotFound());
}

function documentNotFound() {
	throw new Error({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: messages.DOCUMENT_NOT_FOUND,
	});
}

module.exports = { get };