const jwt = require("jsonwebtoken");
const config = require("../config/config");
const resData = require("../consts/resData")
const HttpStatus = require('http-status-codes');

async function user(token) {
	var res = {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.UNKNOWN_ERROR,
	};
	try {
		if (!token) {
			res.status = HttpStatus.BAD_REQUEST;
			res.data = resData.TOKEN_NOT_SUPPLIED_ERROR;
			throw res;
		}
		if (token.startsWith('Bearer ')) {
			token = token.slice(7, token.length);
		}
		return jwt.verify(token, config.key, (err, decoded) => {
			if (err) {
				res.status = HttpStatus.BAD_REQUEST;
				res.data = resData.TOKEN_NOT_VALID_ERROR;
				throw res;
			}
			res = decoded;
			res.success = true;
			return res;
		});
	} catch (err) {
		throw res;
	}
}

function admin(token) {
	var res = {
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		data: resData.UNKNOWN_ERROR,
	};
	try {
		if (!token) {
			res.status = HttpStatus.BAD_REQUEST;
			res.data = resData.TOKEN_NOT_SUPPLIED_ERROR;
			throw res;
		}
		if (token.startsWith('Bearer ')) {
			token = token.slice(7, token.length);
		}
		return jwt.verify(token, config.key, (err, decoded) => {
			if (err) {
				res.status = HttpStatus.BAD_REQUEST;
				res.data = resData.TOKEN_NOT_VALID_ERROR;
				throw res;
			}
			res = decoded;
			const uid = res.id;
			User.findOne({ _id: uid }).then(user => {
				if (!user) {
					res.status = HttpStatus.BAD_REQUEST;
					res.data = resData.TOKEN_NOT_VALID_ERROR;
					throw res;
				}
				if (user.role === "admin") {
					res.success = true;
					return res;
				} else {
					res.status = HttpStatus.BAD_REQUEST;
					res.data = resData.TOKEN_NOT_VALID_ERROR;
					throw res;
				}
			});
		});
	} catch (err) {
		throw res;
	}
}

	module.exports = { user, admin };