const isEmpty = require("is-empty");
const axios = require("axios");

module.exports = async function validateWebsites(website, username) {
	let errors = {};

	switch (website) {
		case 'GitHub':
			var res = await axios.get("https://api.github.com/users/" + username).then(res => { }).catch(err => {
				errors.github = "GitHub account not found";
			});
			break;

		case 'Medium':
			var res = await axios.get("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@" + username).then(res => { }).catch(err => {
				errors.medium = "Medium account not found";
			});
			break;

		case 'Stackoverflow':
			var res = await axios.get(
				"https://api.stackexchange.com/2.2/users/" +
				username +
				"?site=stackoverflow"
			).then(res => { }).catch(err => {
				errors.stackoverflow = "Stackoverflow account not found";
			});
			break;
	}
	return {
		errors,
		isValid: isEmpty(errors)
	};
};