const jwt = require("jsonwebtoken");
const config = require("../config/config");
const messages = require("../consts/messages")

// the token validator function
// return the user object with `success = true` if able to validate token
module.exports = function (token, callback) {
    try {
        if (!token) {
            return callback(messages.TOKEN_NOT_SUPPLIED_ERROR);
        }
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        jwt.verify(token, config.key, (err, decoded) => {
            if (err) {
                return callback(messages.TOKEN_NOT_VALID_ERROR);
            }
            res = decoded;
            res['success'] = true;
            return callback(res);
        });
    } catch (err) {
        return callback(messages.UNKNOWN_ERROR);
    }
}