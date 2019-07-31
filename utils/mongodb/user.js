const documents = require("../../consts/documents");
const messages = require("../../consts/messages");
const User = require("../../models/User");
const HttpStatus = require('http-status-codes');

function get(userId) {
	return User.findById(userId).then(user => {		
		return user;
	}).catch(err => documentNotFound());
}

function getAll() {
	return User.find({}).then(user => {		
		return user;
	}).catch(err => documentNotFound());
}

function put(user) {
	return User.findOneAndUpdate(
		{ _id: user.id },
		{ $set: { user } },
		{ upsert: true }).then(user => {
			return true;
		}).catch(err => documentNotFound());
}

function putAccounts(userId, accounts) {
	return User.findOneAndUpdate(
		{ _id: userId },
		{ $set: { accounts } },
		{ upsert: true }).then(user => {
			return true;
		}).catch(err => documentNotFound());
}

function putSettings(userId, name, email, bonusPoints) {
	return User.findOneAndUpdate(
		{ _id: userId },
		{ $set: { name, email, bonusPoints } },
		{ upsert: true }).then(user => {
			return true;
		}).catch(err => documentNotFound());
}

function documentNotFound() {
	throw new Error({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: messages.DOCUMENT_NOT_FOUND,
	});
}

module.exports = { get, getAll, put, putAccounts, putSettings };