const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(oldData, newData) {
	let errors = {};

	newData.name = !isEmpty(newData.name) ? newData.name : "";
	newData.points = !isEmpty(newData.points) ? newData.points : null;
	newData.type = !isEmpty(newData.type) ? newData.type : null;
	
	switch (newData.action) {
		case 'delete':
			if (oldData.type === "website") {
				errors.type = "You can't delete a website."
			}
			break;
		case 'new':
			if (oldData.type === "website") {
				errors.action = "Can't create a new website."
			}
		default:
			if (Validator.isEmpty(newData.name)) {
				errors.name = "Name field is required";
			}
			if (!newData.points) {
				errors.points = "points field is required";
			}
			if (Validator.isEmpty(newData.type)) {
				errors.type = "Type field is required";
			}
			
			if (oldData.type !== newData.type) {
				errors.type = "Error with getting type";
			}
			if (oldData.type === "website") {
				if (oldData.name !== newData.name) {
					errors.name = "Can't change website name.";
				}
			}
			break;
	}
	
	return {
		errors,
		isValid: isEmpty(errors)
	};
};