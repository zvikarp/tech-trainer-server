const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateAccounts(data) {
	var messages = [];

	data.name = !isEmpty(data.name) ? data.name : "";
	data.type = !isEmpty(data.type) ? data.type : "";
	data.prefix = !isEmpty(data.prefix) ? data.prefix : "";

	if (Validator.isEmpty(data.name)) {
		messages.push("Name field is required");
	}
	if (!data.points) {
		messages.push("Points field is required");
	}
	if (Validator.isEmpty(data.type)) {
		messages.push("Type field is required");
	}
	if (data.type === "api") {
		if (Validator.isEmpty(data.prefix))
			messages.push("Website Prefix field is required");
	}

	return {
		messages,
		success: isEmpty(messages)
	};
};