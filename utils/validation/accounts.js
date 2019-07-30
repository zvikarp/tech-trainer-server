const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateAccounts(oldData, newData) {
	var messages = [];

	newData.name = !isEmpty(newData.name) ? newData.name : "";
	newData.points = !isEmpty(newData.points) ? newData.points : null;
	newData.type = !isEmpty(newData.type) ? newData.type : null;
	
	switch (newData.action) {
		case 'delete':
			if (oldData.type === "website") {
				messages.push("You can't delete a website.");
			}
			break;
		case 'new':
			if (oldData.type === "website") {
				messages.push("Can't create a new website.");
			}
		default:
			if (Validator.isEmpty(newData.name)) {
				messages.push("Name field is required");
			}
			if (!newData.points) {
				messages.push("points field is required");
			}
			if (Validator.isEmpty(newData.type)) {
				messages.push("Type field is required");
			}
			
			if (oldData.type !== newData.type) {
				messages.push("Error with getting type");
			}
			if (oldData.type === "website") {
				if (oldData.name !== newData.name) {
					messages.push("Can't change website name.");
				}
			}
			break;
	}
	
	return {
		messages,
		success: isEmpty(messages)
	};
};