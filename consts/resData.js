module.exports = {
	UNKNOWN_ERROR: {
		'success': false,
		'messages': ['An unknown error occurred, please try again'],
	},
	TOKEN_NOT_VALID_ERROR: {
		'success': false,
		'messages': ['Auth token is not valid'],
	},
	TOKEN_NOT_SUPPLIED_ERROR: {
		'success': false,
		'messages': ['Auth token is not supplied'],
	},
	USER_NOT_FOUND_ERROR: {
		'success': false,
		'messages': ['It seems like the user does not exist in our databases'],
	},
	GENERAL_SUCCESS: {
		'success': true,
		'messages': ['The operation was successful'],
	},
	USER_PERMISSIONS_ERROR: {
		'success': false,
		'messages': ['This user does not have permission to do this operation'],
	},
	DOCUMENT_NOT_FOUND: {
		'success': false,
		'messages': ['The document was not found'],
	},
	PASSWORD_INCORRECT: {
		'success': false,
		'messages': ['Password is incorrect'],
	},
	EMAIL_NOT_FOUND: {
		'success': false,
		'messages': ['Email not found'],
	},
	EMAIL_EXISTS: {
		'success': false,
		'messages': ['The email already exists, please try signing in.'],
	},
};