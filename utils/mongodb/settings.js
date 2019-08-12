const consts = require("../../consts/consts");
const resData = require("../../consts/resData");
const Settings = require("../../models/Settings");
const HttpStatus = require('http-status-codes');

function get() {
	return Settings.findById(consts.ACCOUNTS_DOCUMENT).then(settings => {
		return settings;
	}).catch(err => documentNotFound());
}

function put(accounts) {
	return Settings.findOneAndUpdate(
		{ _id: consts.ACCOUNTS_DOCUMENT },
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