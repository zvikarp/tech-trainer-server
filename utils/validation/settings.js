const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(data) {
	var messages = [];
	// Convert empty fields to an empty string so we can use validator functions
	data.name = !isEmpty(data.name) ? data.name : "";
	data.email = !isEmpty(data.email) ? data.email : "";
	// Name checks
	if (Validator.isEmpty(data.name)) {
		messages.push("Name field is required");
	}
	// Email checks
	if (Validator.isEmpty(data.email)) {
		messages.push("Email field is required");
	} else if (!Validator.isEmail(data.email)) {
		messages.push("Email is invalid");
	}
	
	return {
		messages,
		success: isEmpty(messages)
	};
};