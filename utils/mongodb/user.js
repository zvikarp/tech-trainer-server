const resData = require("../../consts/resData");
const User = require("../../models/User");
const HttpStatus = require('http-status-codes');

function get(userId) {
	return User.findById(userId).then(user => {
		return user;
	}).catch(err => documentNotFound());
}

function checkIfExistsByEmail(email) {
	return User.find({ email }).then(docs => {
		return (docs.length === 1);
	}).catch(err => errorAccessingDatabase());
}

function getByEmail(email) {
	return User.findOne({ email }).then(user => {
		return (user);
	}).catch(err => documentNotFound());
}

function getAll() {
	return User.find({}).then(users => {
		return users;
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

function putSettings(userId, newSettings) {
	return User.findOneAndUpdate(
		{ _id: userId },
		{ $set: newSettings },
		{ upsert: true }).then(user => {
			return true;
		}).catch(err => documentNotFound());
}

function putPoints(userId, points) {
	return User.findOneAndUpdate(
		{ _id: userId },
		{ $set: {points } },
		{ upsert: true }).then(user => {
			return true;
		}).catch(err => documentNotFound());
}

function documentNotFound() {
	throw {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.DOCUMENT_NOT_FOUND,
	};
}

function errorAccessingDatabase() {
	throw {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.UNKNOWN_ERROR,
	};
}

function post(post) {
	return post.save();
}

module.exports = { get, getAll, put, putAccounts, putSettings, checkIfExistsByEmail, getByEmail, putPoints, post };