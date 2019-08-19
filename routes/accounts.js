const express = require("express");
const HttpStatus = require('http-status-codes');

const consts = require("../consts/consts");
const resData = require("../consts/resData");
const mongodbSettings = require("../utils/mongodb/settings");
const verifier = require("../utils/verifier");
const validateAccounts = require("../utils/validation/accounts");

const router = express.Router();

// route:  GET api/accounts/
// access: Authed
// desc:   api returns all settings
router.get("/", async (req, res) => {
	try {
		await verifier.user(req.headers[consts.AUTH_HEADER]);
		const settings = await mongodbSettings.get();
		const accounts = settings.accounts;
		delete accounts._id; // NOTE: the `_id` is NOT supposed to be there.
		// it can't be deleted from the db and i dont want to recreate the whole object.
		return res.json(accounts);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// route:  GET api/accounts/
// access: Public
// desc:   api returns passing points
router.get("/passing", async (req, res) => {
	try {
		const settings = await mongodbSettings.get();
		const passing = settings.passing;
		return res.json(passing);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// route:  PUT api/accounts/passing
// access: Admin
// desc:   api updates the passing points
router.put("/passing", async (req, res) => {
	try {
		await verifier.admin(req.headers[consts.AUTH_HEADER]);
		const passing = req.body.passing;
		await mongodbSettings.putPassing(passing);
		return res.json(resData.GENERAL_SUCCESS);
	}
	catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// route:  PUT api/accounts/accounts
// access: Admin
// desc:   api updates the settings
router.put("/accounts", async (req, res) => {
	try {
		await verifier.admin(req.headers[consts.AUTH_HEADER]);
		const settings = await mongodbSettings.get();
		const serverAccounts = settings.accounts;
		const recivedAccounts = req.body.accounts;
		const updatedAccounts = getUpdatedAccountsArray(serverAccounts, recivedAccounts);
		await mongodbSettings.putAccounts(updatedAccounts);
		return res.json(resData.GENERAL_SUCCESS);
	}
	catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

function getUpdatedAccountsArray(serverAccounts, recivedAccounts) {
	Object.keys(recivedAccounts).forEach(accountId => {
		const account = recivedAccounts[accountId];
		const oldAccount = getAccountFromServerArray(serverAccounts, account, accountId);
		const accountValid = validateAccounts(oldAccount, account);
		if (!accountValid.success) {
			throw { status: HttpStatus.BAD_REQUEST, data: accountValid };
		}
		serverAccounts = updateServerArray(serverAccounts, account, accountId);
	});
	return serverAccounts;
}

function getAccountFromServerArray(serverAccounts, account, accountId) {
	const isNew = account.action === 'new';
	const isInDatabase = serverAccounts[accountId] !== undefined;
	if (isNew === isInDatabase) {
		throw {
			status: HttpStatus.BAD_REQUEST,
			data: resData.UNKNOWN_ERROR,
		};
	}
	return serverAccounts[accountId] || account;
}

function updateServerArray(serverAccounts, account, accountId) {
	if (account.action === 'delete') {
		delete serverAccounts[accountId];
		return serverAccounts;
	}
	account.action = 'modified';
	serverAccounts[accountId] = account;
	return serverAccounts;
}

module.exports = router;
