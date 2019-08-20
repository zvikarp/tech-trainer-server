const HttpStatus = require('http-status-codes');
const axios = require("axios");

function generateUrl(username) {
	return "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@" + username;
}

async function get(username) {
	try {
		var res = await axios.get(generateUrl(username));
		return res.data.items.length;
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