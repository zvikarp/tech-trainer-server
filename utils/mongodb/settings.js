const documents = require("../../consts/documents");
const messages = require("../../consts/messages");
const Settings = require("../../models/Settings");
const HttpStatus = require('http-status-codes');

function get() {
	return Settings.findById(documents.ACCOUNTS).then(settings => {
		return settings;
	}).catch(err => {
		throw new Error({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			message: messages.DOCUMENT_NOT_FOUND,
		});
	});
}

function put(accounts) {
	return Settings.findOneAndUpdate(
		{ _id: documents.ACCOUNTS },
		{ $set: { accounts: accounts } },
		{ upsert: true }).then(settings => {
			return true;
		}).catch(err => {
			throw new Error({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: messages.DOCUMENT_NOT_FOUND,
			});
		});
}

module.exports = { get, put };