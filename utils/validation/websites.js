const isEmpty = require("is-empty");
const axios = require("axios");

module.exports = async function validateWebsites(website, username) {
	var messages = [];

	switch (website) {
		case 'GitHub':
			await axios.get("https://api.github.com/users/" + username).then(res => { }).catch(err => {
				messages.push("GitHub account not found");
			});
			break;

		case 'Medium':
			await axios.get("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@" + username).then(res => { }).catch(err => {
				messages.push("Medium account not found");
			});
			break;

		case 'Stackoverflow':
			await axios.get(
				"https://api.stackexchange.com/2.2/users/" +
				username +
				"?site=stackoverflow"
			).then(res => { console.log("Gdfgdfgdfgfd");
			}).catch(err => {
				messages.push("Stackoverflow account not found");
			});
			break;
	}	
	return {
		messages,
		success: isEmpty(messages)
	};
};