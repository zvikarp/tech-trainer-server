const jwt = require("jsonwebtoken");
const config = require("../config/config");
const messages = require("../consts/messages")
const HttpStatus = require('http-status-codes');

async function user(token) {
	var res = {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: messages.UNKNOWN_ERROR,
	};
	try {
		if (!token) {
			res.status = HttpStatus.BAD_REQUEST;
			res.message = messages.TOKEN_NOT_SUPPLIED_ERROR;
			throw new Error(res);
		}
		if (token.startsWith('Bearer ')) {
			token = token.slice(7, token.length);
		}
		return jwt.verify(token, config.key, (err, decoded) => {
			if (err) {
				res.status = HttpStatus.BAD_REQUEST;
				res.message = messages.TOKEN_NOT_VALID_ERROR;
				throw new Error(res);
			}
			res = decoded;
			res['success'] = true;
			return (res);
		});
	} catch (err) {
		throw new Error(res);
	}
}

function admin(token, callback) {
	var res = {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		message: messages.UNKNOWN_ERROR,
	};
	try {
		if (!token) {
			res.status = HttpStatus.BAD_REQUEST;
			res.message = messages.TOKEN_NOT_SUPPLIED_ERROR;
			throw new Error(res);
		}
		if (token.startsWith('Bearer ')) {
			token = token.slice(7, token.length);
		}
		return jwt.verify(token, config.key, (err, decoded) => {
			if (err) {
				res.status = HttpStatus.BAD_REQUEST;
				res.message = messages.TOKEN_NOT_VALID_ERROR;
				throw new Error(res);
			}
			res = decoded;
			const uid = res.id;
			User.findOne({ _id: uid }).then(user => {
				if (!user) {
					res.status = HttpStatus.BAD_REQUEST;
					res.message = messages.TOKEN_NOT_VALID_ERROR;
					throw new Error(res);
				}
				if (user.role === "admin") {
					res['success'] = true;
					return res;
				} else {
					res.status = HttpStatus.BAD_REQUEST;
					res.message = messages.TOKEN_NOT_VALID_ERROR;
					throw new Error(res);
				}
			});
		});
	} catch (err) {
		return res;
	}
}

	module.exports = { user, admin };