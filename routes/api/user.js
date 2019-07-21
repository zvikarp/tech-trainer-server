const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const userVerifier = require("../../config/userVerifier");
const User = require("../../models/User");
const messages = require("../../sheard/messages");
const validateSettingsInput = require("../../validation/settings");


// @route POST api/user/accounts/update
// @access User
// api updates the users connected accounts ids.
router.post('/accounts/update', (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			var accounts = user.accounts;
			const newAccounts = req.body.accounts;
			var errorMsg = "";
			Object.keys(newAccounts).forEach(key => {
				accounts[key] = newAccounts[key];

			});
			User.findOneAndUpdate({ _id: uid }, { $set: { accounts: accounts } }, { upsert: false }).then(user => {
				if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
				return routerRes.json(messages.GENERAL_SUCCESS);
			});
		});
	});
});


// @route GET api/user/accounts/get
// @access User
// api gets all users active connected accounts details.
router.get('/accounts/get', (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			var accounts = user.accounts;
			return routerRes.json(accounts);
		});
	});
});


// @route GET api/user/admin/get
// @access User
// api return if current user is admin or not
router.get('/admin/get', (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			var admin = user.role === 'admin';
			return routerRes.json({ 'admin': admin });
		});
	});
});


// @route GET api/user/get
// @access User
// api return current user detailes
router.get('/get', (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			return routerRes.json({user});
		});
	});
});


// @route POST api/user/settings/update
// @access User
// api updates the users settings.
router.post('/settings/update', (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			var userName = user.name;
			var userEmail = user.email;
			if (req.body.name) userName = req.body.name;
			if (req.body.email) userEmail = req.body.email;
			const { errors, isValid } = validateSettingsInput(req.body);
			if (!isValid) {
				return res.status(400).json(errors);
			}
			User.findOneAndUpdate({ _id: uid }, { $set: { email: userEmail, name: userName } }, { upsert: false }).then(user => {
				if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
				return routerRes.json(messages.GENERAL_SUCCESS);
			});
		});
	});
});


module.exports = router;
