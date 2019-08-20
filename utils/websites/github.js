const HttpStatus = require('http-status-codes');
const axios = require("axios");

function generateUrl(username) {
	return "https://api.github.com/users/" + username;
}

async function get(username) {
	try {
		var res = await axios.get(
			generateUrl(username) + "/repos"
		);
		return res.data.length;
	} catch (err) {
		return 0;
	}
}

async function validate(username) {
	try {
		await axios.get(generateUrl(username));
	} catch (err) {
		throw err;
	}
}

module.exports = { get, validate };