const express = require("express");
const router = express.Router();
const userVerifier = require("../../config/userVerifier");
const adminVerifier = require("../../config/adminVerifier");
const User = require("../../models/User");
const messages = require("../../sheard/messages");
const validateSettingsInput = require("../../validation/settings");
const validateWebsites = require("../../validation/websites");


async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}


// @route POST api/user/accounts/update
// @access User
// api updates the users connected accounts ids.
router.post('/accounts/update', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['authorization'], (verifierRes) => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		var lastError;
		User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(async (settings) => {
				if (!settings) routerRes.status(400).json(messages.UNKNOWN_ERROR);
				var serverAccounts = settings.accounts;
				var accounts = user.accounts;
				const newAccounts = req.body.accounts;
				var errorMsg = "";
				await asyncForEach(Object.keys(newAccounts), async (key) => {
				// await Object.keys(newAccounts).forEach(async (key) => {
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
					return routerRes.json({message: lastError});
				} else {
					User.findOneAndUpdate({ _id: uid }, { $set: { accounts: accounts } }, { upsert: false }).then(user => {
						if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
						return routerRes.json(messages.GENERAL_SUCCESS);
					});
				}
			});
		});
	});
});


// @route GET api/user/accounts/get
// @access User
// api gets all users active connected accounts details.
router.get('/accounts/get', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
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
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
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
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		var uid = verifierRes.id;		
		if ((req.headers['userid']) && (req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {			
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return routerRes.status(400).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					User.findOne({ _id: uid }).then(user => {
						if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
						user.password = undefined;
						return routerRes.json({ user });
					});
				}
			});
		} else {
			User.findOne({ _id: uid }).then(user => {
				if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
				user.password = undefined;
				return routerRes.json({ user });
			});
		}
	});
});


// @route POST api/user/settings/update
// @access User
// api updates the users settings.
router.post('/settings/update', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
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
