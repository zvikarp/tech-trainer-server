const express = require("express");
const HttpStatus = require('http-status-codes');

const messages = require("../consts/messages");
const User = require("../models/User");
const userVerifier = require("../utils/verifiers/userVerifier");
const adminVerifier = require("../utils/verifiers/adminVerifier");
const validateSettingsInput = require("../utils/validation/settings");
const validateWebsites = require("../utils/validation/websites");
const mongodbUser = require("../utils/mongodb/user");
const verifier = require("../utils/verifier");
const mongodbSettings = require("../utils/mongodb/settings");

const router = express.Router();

// converts a `forEach` function to a async one
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

// route:  PUT api/user/accounts/:id
// access: User
// desc:   api updates the users connected accounts.
router.put('/accounts/:id', async (req, res) => {
	try {
		const user = await verifier.user(req.headers['authorization']);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(user.id);
		await updateUserAccounts(userId, res, req.body.accounts);
		return res.json(messages.GENERAL_SUCCESS);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const resMessages = err || messages.UNKNOWN_ERROR;
		return res.status(status).json(resMessages);
	}
});

function removeUserAccount(userAccounts, accountId) {
	delete userAccounts[accountId];
	return userAccounts;
}

// if not website -> dont need to validate, but if is then first validate account name
async function updateAndValidateUserAccount(userAccounts, serverAccount, newAccount, accountId) {
	const isWebsite = (newAccount !== "") && (serverAccount.type === "website");
	const valid = !isWebsite || await validateWebsites(serverAccount.name, newAccount);
	if ((valid !== true) && (!valid.success)) throw valid;
	userAccounts[accountId] = newAccount;
	return userAccounts;
}

async function updateAndValidateUserAccounts(serverAccounts, userAccounts, newAccounts) {
	await asyncForEach(Object.keys(newAccounts), async (accountId) => {
		const serverAccount = serverAccounts[accountId];
		const newAccount = newAccounts[accountId];
		if (!serverAccount) {
			userAccounts = removeUserAccount(userAccounts, accountId);
		} else {
			userAccounts = await updateAndValidateUserAccount(userAccounts, serverAccount, newAccount, accountId);
		}
	});
	return userAccounts;
}

async function updateUserAccounts(userId, newAccounts) {
	const user = await mongodbUser.get(userId);
	const settings = await mongodbSettings.get();
	const serverAccounts = settings.accounts;
	const userAccounts = user.accounts;
	const updatedAccounts = await updateAndValidateUserAccounts(serverAccounts, userAccounts, newAccounts);
	await mongodbUser.putAccounts(userId, updatedAccounts);
}

// route:  GET api/user/accounts/:id
// access: User/Admin
// desc:   api gets the users connected accounts.
router.get('/accounts/:id', async (req, res) => {
	try {
		const user = await verifier.user(req.headers['token']);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(user.id);
		const userFromDatabase = await mongodbUser.get(userId);
		const userAccounts = userFromDatabase.accounts;
		return res.json(userAccounts);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const message = err.message || messages.UNKNOWN_ERROR;
		return res.status(status).json(message);
	}
});

// route:  GET api/user/admin/:id
// access: Auth
// desc:   api return if current user is admin or not
router.get('/admin/:id', async (req, res) => {
	try {
		const user = await verifier.user(req.headers['token']);
		const userId = req.params.id;
		const userFromDatabase = await mongodbUser.get(userId);
		var admin = userFromDatabase.role === 'admin';
		return res.json({ 'admin': admin });
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const message = err.message || messages.UNKNOWN_ERROR;
		return res.status(status).json(message);
	}
});

// route:  GET api/user/get
// access: User/Admin
// desc:   api return current user detailes
router.get('/get', (req, res) => {
	userVerifier(req.headers['token'], (verifierRes) => {
		if (!verifierRes.success) {
			return res.status(HttpStatus.FORBIDDEN).json(verifierRes);
		}
		var uid = verifierRes.id;
		if ((req.headers['userid']) && (req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return res.status(HttpStatus.FORBIDDEN).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					return userGet(uid, res);
				}
			});
		} else {
			return userGet(uid, res);
		}
	});
});

function userGet(userId, res) {
	User.findOne({ _id: userId }).then(user => {
		if (!user) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
		user.password = undefined;
		return res.json({ user });
	});
}


// route:  POST api/user/settings/update
// access: User/Admin
// desc:   api updates the users settings.
router.post('/settings/update', (req, res) => {
	userVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return res.status(HttpStatus.FORBIDDEN).json(verifierRes);
		}
		var uid = verifierRes.id;
		if ((req.headers['userid']) && (req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return res.status(HttpStatus.FORBIDDEN).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					return updateUserSettings(uid, req, res, true);
				}
			});
		} else {
			return updateUserSettings(uid, req, res, false);
		}
	});
});

function updateUserSettings(userId, req, res, isAdmin) {
	User.findOne({ _id: userId }).then(user => {
		if (!user) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
		var userName = user.name;
		var userEmail = user.email;
		var bonusPoints = user.bonusPoints;
		if (req.body.name) userName = req.body.name;
		if (req.body.email) userEmail = req.body.email;
		if (isAdmin && req.body.bonusPoints) bonusPoints = req.body.bonusPoints;
		const { errors, isValid } = validateSettingsInput(req.body);
		if (!isValid) {
			return res.status(HttpStatus.BAD_REQUEST).json(errors);
		}
		User.findOneAndUpdate({ _id: userId }, { $set: { email: userEmail, name: userName, bonusPoints: bonusPoints } }, { upsert: true }).then(user => {
			if (!user) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
			return res.json(messages.GENERAL_SUCCESS);
		});
	});
}


module.exports = router;
