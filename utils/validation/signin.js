const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateSigninInput(data) {
	
	var messages = [];

	data.email = !isEmpty(data.email) ? data.email : "";
	data.password = !isEmpty(data.password) ? data.password : "";

	if (Validator.isEmpty(data.email)) {
		messages.push("Email field is required");
	} else if (!Validator.isEmail(data.email)) {
		messages.push("Email is invalid");
	}

	if (Validator.isEmpty(data.password)) {
		messages.push("Password field is required");
	}

	return {
		messages,
		success: isEmpty(messages)
	};
};