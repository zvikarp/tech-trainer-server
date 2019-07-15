const jwt = require("jsonwebtoken");
const keys = require("./keys");
const messages = require("../sheard/messages")

// the token validator function
// return the user object with `success = true` if able to validate token
module.exports = function (token, callback) {
    try {
        if (!tozken) {
            return callback(messages.TOKEN_NOT_SUPPLIED_ERROR);
        }
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        jwt.verify(token, keys.secretOrKey, (err, decoded) => {
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