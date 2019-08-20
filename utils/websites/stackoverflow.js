const HttpStatus = require('http-status-codes');
const axios = require("axios");

function generateUrl(username) {
	return ("https://api.stackexchange.com/2.2/users/" +
	username +
	"?site=stackoverflow");
}

async function get(username) {
	try {
		var res = await axios.get(generateUrl(username));
		return res.data.items[0].reputation;
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
