const express = require("express");
const router = express.Router();

const userVerifier = require("../utils/userVerifier");
const adminVerifier = require("../utils/adminVerifier");
const Settings = require("../models/Settings");
const validateAccounts = require("../utils/validation/accounts");
const documents = require("../consts/documents");
const messages = require("../consts/messages");
const statusCodes = require("../consts/statusCodes");


// route:  GET api/accounts/get
// access: Authed
// desc:   api returns all types of accounts
router.get("/get", (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		}
		Settings.findOne({ _id: documents.ACCOUNTS }).then(settings => {
			if (settings) {
				return routerRes.json(settings.accounts)
			} else {
				return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.DOCUMENT_NOT_FOUND);
			}
		});
	});
});

// route:  POST api/accounts/update
// access: Admin
// desc:   api updates the accounts info
router.post("/update", (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	adminVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		} else {
			Settings.findOne({ _id: documents.ACCOUNTS }).then(settings => {
				if (settings) {
					var hasErrors = false;
					var serverAccounts = settings.accounts;
					const recivedAccounts = req.body.accounts;

					Object.keys(recivedAccounts).forEach(accountId => {
						var account = recivedAccounts[accountId];
						var oldAccount = account;
						
						if (account.action !== 'new') {
							if (!serverAccounts[accountId]) {
								hasErrors = true;
							}
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
					if (hasErrors) return routerRes.status(400).json("errors");
					Settings.findOneAndUpdate({ _id: documents.ACCOUNTS }, { $set: { accounts: serverAccounts } }, { upsert: true }).then(u => {

						return routerRes.json(serverAccounts)

					}).catch(err => {
						console.log(err);
					});
				} else {
					return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.DOCUMENT_NOT_FOUND);
				}
			});
		}
	});
});

module.exports = router;