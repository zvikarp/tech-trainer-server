const messages = {
    UNKNOWN_ERROR: {
        'success': false,
        'message': 'An unknown error occurred, please try again.'
    },
    TOKEN_NOT_VALID_ERROR: {
        'success': false,
        'message': 'Auth token is not valid'
    },
    TOKEN_NOT_SUPPLIED_ERROR: {
        'success': false,
        'message': 'Auth token is not supplied'
    },
    USER_NOT_FOUND_ERROR: {
        'success': false,
        'message': 'It seems like the user does not exist in our databases'
    },
    GENERAL_SUCCESS: {
        'success': true,
        'message': 'The operation was successful'
    },
    USER_PERMISSIONS_ERROR: {
        'success': false,
        'message': 'This user does not have permission to do this operation'
    },
    ACCOUNTS_NOT_FOUND: {
        'success': false,
        'message': 'The accounts settings documents was not found'
    },
};

module.exports = messages;