const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const userVerifier = require("../../config/userVerifier");
const adminVerifier = require("../../config/adminVerifier");
const Settings = require("../../models/Settings");

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
		Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(accounts => {
			if (accounts) {
				
				return routerRes.json(accounts)
			} else {
				return routerRes.status(400).json({ accounts: "invalid request" });
			}
		});
	});
});

module.exports = router;
