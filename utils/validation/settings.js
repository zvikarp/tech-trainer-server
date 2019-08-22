const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(data) {
	var messages = [];
	// Convert empty fields to an empty string so we can use validator functions
	data.name = !isEmpty(data.name) ? data.name : "";
	data.email = !isEmpty(data.email) ? data.email : "";
	data.password = !isEmpty(data.password) ? data.password : "";
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
	if (!Validator.isEmpty(data.password)) {
		if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
			messages.push(
				"Password must be at least 6 characters, and less then 30 characters"
			);
		}
	}
	return {
		messages,
		success: isEmpty(messages)
	};
};
