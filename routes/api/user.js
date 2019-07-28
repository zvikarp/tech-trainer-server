const express = require("express");
const router = express.Router();

const userVerifier = require("../../config/userVerifier");
const adminVerifier = require("../../config/adminVerifier");
const validateSettingsInput = require("../../validation/settings");
const validateWebsites = require("../../validation/websites");
const User = require("../../models/User");
const messages = require("../../sheard/messages");
const documents = require("../../sheard/documents");
const statusCodes = require("../../sheard/statusCodes");

// converts a `forEach` function to a async one
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}


// route:  POST api/user/accounts/update
// access: User
// desc:   api updates the users connected accounts.
router.post('/accounts/update', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		}
		var uid = verifierRes.id;
		if ((req.headers['userid']) && (req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					updateUserAccounts(uid, routerRes, req.body.accounts);
				}
			});
		} else {
			updateUserAccounts(uid, routerRes, req.body.accounts);
		}
	});
});

function updateUserAccounts(userId, routerRes, newAccounts) {
	var lastError;
	User.findOne({ _id: userId }).then(user => {
		if (!user) return routerRes.status(statusCodes.BAD_REQUEST).json(messages.USER_NOT_FOUND_ERROR);
		Settings.findOne({ _id: documents.ACCOUNTS }).then(async (settings) => {
			if (!settings) routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.UNKNOWN_ERROR);
			var serverAccounts = settings.accounts;
			var accounts = user.accounts;
			await asyncForEach(Object.keys(newAccounts), async (key) => {
				if (serverAccounts[key]) {
					if ((newAccounts[key] !== "") && (serverAccounts[key].type === "website")) {
						const { errors, isValid } = await validateWebsites(serverAccounts[key].name, newAccounts[key]);
						if (!isValid) {
							lastError = errors;
						}
					}
					accounts[key] = newAccounts[key];
				}
			});
			if (lastError) {
				return routerRes.json({ message: lastError });
			} else {
				User.findOneAndUpdate({ _id: userId }, { $set: { accounts: accounts } }, { upsert: false }).then(user => {
					if (!user) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
					return routerRes.json(messages.GENERAL_SUCCESS);
				});
			}
		});
	});
}


// route:  POST api/user/accounts/get
// access: User
// desc:   api gets the users connected accounts.
router.get('/accounts/get', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		}
		var uid = verifierRes.id;
		if ((req.headers['userid']) && (req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					return accountsGet(uid, routerRes);
				}
			});
		} else {
			return accountsGet(uid, routerRes);
		}
	});
});

function accountsGet(userId, routerRes) {
	User.findOne({ _id: userId }).then(user => {
		if (!user) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
		var accounts = user.accounts;
		return routerRes.json(accounts);
	});
}

// route:  GET api/user/admin/get
// access: User
// desc:   api return if current user is admin or not
router.get('/admin/get', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(statusCodes.BAD_REQUEST).json(verifierRes);
		}
		const uid = verifierRes.id;
		User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(statusCodes.BAD_REQUEST).json(messages.USER_NOT_FOUND_ERROR);
			var admin = user.role === 'admin';
			return routerRes.json({ 'admin': admin });
		});
	});
});


// route:  GET api/user/get
// access: User/Admin
// desc:   api return current user detailes
router.get('/get', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		}
		var uid = verifierRes.id;
		if ((req.headers['userid']) && (req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					return userGet(uid, routerRes);
				}
			});
		} else {
			return userGet(uid, routerRes);
		}
	});
});

function userGet(userId, routerRes) {
	User.findOne({ _id: userId }).then(user => {
		if (!user) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
		user.password = undefined;
		return routerRes.json({ user });
	});
}


// route:  POST api/user/settings/update
// access: User/Admin
// desc:   api updates the users settings.
router.post('/settings/update', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		}
		var uid = verifierRes.id;
		if ((req.headers['userid']) && (req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					return updateUserSettings(uid, req, routerRes, true);
				}
			});
		} else {
			return updateUserSettings(uid, req, routerRes, false);
		}
	});
});

function updateUserSettings(userId, req, routerRes, isAdmin) {
	User.findOne({ _id: userId }).then(user => {
		if (!user) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
		var userName = user.name;
		var userEmail = user.email;
		var bonusPoints = user.bonusPoints;
		if (req.body.name) userName = req.body.name;
		if (req.body.email) userEmail = req.body.email;
		console.log(req.body.bonusPoints);

		if (isAdmin && req.body.bonusPoints) bonusPoints = req.body.bonusPoints;
		const { errors, isValid } = validateSettingsInput(req.body);
		if (!isValid) {
			return res.status(statusCodes.BAD_REQUEST).json(errors);
		}
		User.findOneAndUpdate({ _id: userId }, { $set: { email: userEmail, name: userName, bonusPoints: bonusPoints } }, { upsert: true }).then(user => {
			if (!user) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
			return routerRes.json(messages.GENERAL_SUCCESS);
		});
	});
}


module.exports = router;
