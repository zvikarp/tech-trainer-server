const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const userVerifier = require("../../config/userVerifier");
const adminVerifier = require("../../config/adminVerifier");
const Settings = require("../../models/Settings");
const validateAccounts = require("../../validation/accounts");

// @route GET api/accounts/get
// @access Authed
// api returns all types of accounts
router.get("/get", (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(settings => {
			if (settings) {
				return routerRes.json(settings.accounts)
			} else {
				return routerRes.status(400).json({ accounts: "invalid request" });
			}
		});
	});
});

// @route POST api/accounts/update
// @access Admin
// api updates the accounts info
router.post("/update", (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	adminVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		} else {
			Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(settings => {
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
					Settings.findOneAndUpdate({ _id: "5d2b22ac1c9d4400006d66ef" }, { $set: { accounts: serverAccounts } }, { upsert: true }).then(u => {

						return routerRes.json(serverAccounts)

					}).catch(err => {
						console.log(err);
					});
				} else {
					// return routerRes.status(400).json({ accounts: "invalid request" });
				}
			});
		}
	});
});

module.exports = router;
