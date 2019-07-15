const jwt = require("jsonwebtoken");
const keys = require("./keys");

// helper function
// returns error object if token not supplied
function returnNotSuppliedError() {
    return { success: false, message: 'Auth token is not supplied' };
}

// helper function
// returns error object if token not valid
function returnNotValidError() {
    return { success: false, message: 'Auth token is not valid' };
}

// helper function
// returns error object if an unknown error happend
function returnUnknownError() {
    return { success: false, message: 'Unknown error while validating token' };
}

// the token validator function
// return the user object with `success = true` if able to validate token
module.exports = function (token, callback) {
    try {
        if (!token) return callback(returnNotSuppliedError()); // check that token not empty
        if (token.startsWith('Bearer ')) token = token.slice(7, token.length); // remove headings
        if (!token) return callback(returnNotSuppliedError()); // check agin if token empty
        jwt.verify(token, keys.secretOrKey, (err, decoded) => { // check token
            if (err) return callback(returnNotValidError()); // if not valid - return error
            res = decoded;
            res['success'] = true; // add success var to the res
            return callback(res); // return the res
        });
    } catch (err) { // if error happend while tring to validate, return error message
        return callback(returnUnknownError());
    }
}