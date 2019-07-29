const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const messages = require("../consts/messages")
const User = require("../models/User");

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
        jwt.verify(token, keys.key, (err, decoded) => {
            if (err) {
                return callback(messages.TOKEN_NOT_VALID_ERROR);
						}
						res = decoded;
						const uid = res.id;
						User.findOne({ _id: uid }).then(user => {
							if (!user) return routerRes.status(400).json(messages.TOKEN_NOT_VALID_ERROR);
							if (user.role === "admin") {
								res['success'] = true;
								return callback(res);
							} else {
								return routerRes.status(400).json(messages.TOKEN_NOT_VALID_ERROR);
							}
						});
        });
    } catch (err) {
        return callback(messages.UNKNOWN_ERROR);
    }
}