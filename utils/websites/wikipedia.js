const HttpStatus = require('http-status-codes');
const axios = require("axios");

function generateUrl(username) {
	return ("https://en.wikipedia.org/w/api.php?action=query&format=json&list=users&ususers=" +
	username +
	"&usprop=editcount");
}

async function get(username) {
	try {
		var res = await axios.get(generateUrl(username));
		return res.data.query.users[0].editcount;
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
