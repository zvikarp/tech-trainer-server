const express = require("express");
const HttpStatus = require('http-status-codes');

const documents = require("../consts/documents");
const messages = require("../consts/messages");
const Settings = require("../models/Settings");
const mongodbSettings = require("../utils/mongodb/settings");
const userVerifier = require("../utils/verifiers/userVerifier");
const adminVerifier = require("../utils/verifiers/adminVerifier");
const validateAccounts = require("../utils/validation/accounts");

const router = express.Router();


// route:  GET api/accounts/
// access: Authed
// desc:   api returns all types of accounts
router.get("/", (req, routerRes) => {
	return userVerifier(req.headers['token'], async (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(HttpStatus.FORBIDDEN).json(verifierRes);
		}
		try {
			const settings = await mongodbSettings.get();
			return routerRes.json(settings.accounts)
		} catch (err) {
			return routerRes.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
		}
	});
});


// route:  PUT api/accounts/
// access: Admin
// desc:   api updates the accounts info
router.put("/", (req, routerRes) => {
	return adminVerifier(req.headers['authorization'], async (verifierRes) => {
		if (!verifierRes.success)
			return routerRes.status(HttpStatus.FORBIDDEN).json(verifierRes);
		try {
			const settings = await mongodbSettings.get();
			const serverAccounts = settings.accounts;			
			var hasErrors = false;
			const recivedAccounts = req.body.accounts;

			Object.keys(recivedAccounts).forEach(accountId => {
				var account = recivedAccounts[accountId];
				var oldAccount = account;
				if (account.action !== 'new') {
					if (!serverAccounts[accountId]) hasErrors = true;
					oldAccount = serverAccounts[accountId];
				}
				const { errors, isValid } = validateAccounts(oldAccount, account);
				if (!isValid) {
					hasErrors = true;
				}
				if (account.action === "delete") {
					delete serverAccounts[accountId];
				}
				else {
					serverAccounts[accountId] = account;
				}
			});
			if (hasErrors) return routerRes.status(HttpStatus.INTERNAL_SERVER_ERROR).json(putSettings);
			const putSettings = await mongodbSettings.put(serverAccounts);
			if (putSettings) {
				return routerRes.json(messages.GENERAL_SUCCESS);
			}
			return routerRes.status(HttpStatus.INTERNAL_SERVER_ERROR).json(putSettings);
		}
		catch (err) {
			return routerRes.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
		}
	});
});

module.exports = router;
