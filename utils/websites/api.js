const HttpStatus = require('http-status-codes');
const axios = require("axios");

const pathParser = require("./pathParser");

// TODO: use httpStatus

async function get(urlPrefix, username, urlSuffix, path) {
	try {
		var res = await axios.get(urlPrefix + username + urlSuffix);
		res = pathParser.parse(res.data, path);
		return res;
	} catch (err) {
		return 0;
	}
}

async function validate(urlPrefix, username, urlSuffix) {
	try {
		await axios.get(urlPrefix + username + urlSuffix);
	} catch (err) {
		throw err;
	}
}

module.exports = { get, validate };