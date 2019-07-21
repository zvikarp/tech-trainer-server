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
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(accounts => {
			if (accounts) {
				return routerRes.json(accounts)
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
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	adminVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		// Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(accounts => {
			// if (accounts) {
			// 	const recivedAccounts = req.body.accounts;
			// 	Object.keys(recivedAccounts).forEach(accountId => {
			// 		var oldAccount = accounts._doc[accountId];
			// 		// console.log(recivedAccounts[accountId]);
			// 		if (recivedAccounts[accountId].action === "new") oldAccount = recivedAccounts[accountId];
			// 		// console.log(Object.keys(accounts._doc));
					
			// 		const { errors, isValid } = validateAccounts(oldAccount, recivedAccounts[accountId]);
			// 		if (!isValid) {
			// 			return res.status(400).json(errors);
			// 		}
			// 		delete recivedAccounts[accountId].action;
			// 		accounts[accountId] = recivedAccounts[accountId];
			// 		accounts[accountId].points = Number(recivedAccounts[accountId].points);
			// 		console.log(accounts[accountId]);
					
					
				// });
				// console.log(2);
				
				Settings.findOneAndUpdate({ _id: "5d2b22ac1c9d4400006d66ef" }, { $set: { sdfsdfsdfsf: "yjfgh" } }, { upsert: true }).then(u => {
					console.log(u);
					
			// 		console.log("all done!");
			// 		return routerRes.json(accounts)

				}).catch(err => {console.log(err);
				});
			// 	// console.log(accounts);
			// } else {
			// 	// return routerRes.status(400).json({ accounts: "invalid request" });
			// }
		// });
	});
});

module.exports = router;
