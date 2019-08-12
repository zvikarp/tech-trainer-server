const documents = require("../../consts/documents");
const resData = require("../../consts/resData");
const Settings = require("../../models/Settings");
const HttpStatus = require('http-status-codes');

function get() {
	return Settings.findById(documents.ACCOUNTS).then(settings => {
		return settings;
	}).catch(err => documentNotFound());
}

function put(accounts) {
	return Settings.findOneAndUpdate(
		{ _id: documents.ACCOUNTS },
		{ $set: { accounts: accounts } },
		{ upsert: true }).then(settings => {
			return true;
		}).catch(err => documentNotFound());
}

function documentNotFound() {
	throw {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.DOCUMENT_NOT_FOUND,
	};
}

module.exports = { get, put };