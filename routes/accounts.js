const express = require("express");
const HttpStatus = require('http-status-codes');

const resData = require("../consts/resData");
const mongodbSettings = require("../utils/mongodb/settings");
const verifier = require("../utils/verifier");
const validateAccounts = require("../utils/validation/accounts");

const router = express.Router();

// route:  GET api/accounts/
// access: Authed
// desc:   api returns all types of accounts
router.get("/", async (req, res) => {
	try {
		await verifier.user(req.headers['authorization']);
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

// route:  PUT api/accounts/
// access: Admin
// desc:   api updates the accounts info
router.put("/", async (req, res) => {
	try {
		await verifier.admin(req.headers['authorization']);
		const settings = await mongodbSettings.get();
		const serverAccounts = settings.accounts;
		const recivedAccounts = req.body.accounts;
		const updatedAccounts = getUpdatedAccountsArray(serverAccounts, recivedAccounts);
		await mongodbSettings.put(updatedAccounts);
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
			throw {
				status: HttpStatus.BAD_REQUEST,
				data: resData.UNKNOWN_ERROR,
			};
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
