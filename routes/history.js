const express = require("express");
const HttpStatus = require('http-status-codes');

const userVerifier = require("../utils/userVerifier");
const adminVerifier = require("../utils/adminVerifier");
const History = require("../models/History");

const router = express.Router();


// route:  GET api/history/get
// access: User/Admin
// desc:   api gets user history
router.get('/get', (req, routerRes) => {
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(HttpStatus.FORBIDDEN).json(verifierRes);
		}
		var uid = verifierRes.id;
		if ((req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {			
			adminVerifier(req.headers['authorization'], (verifierRes) => {
				if (!verifierRes.success) {
					return routerRes.status(HttpStatus.FORBIDDEN).json(verifierRes);
				} else {
					uid = req.headers['userid'];
					History.find({ userId: uid }).sort({ timestamp: 'desc' }).then(history => {
						return routerRes.json(history);
					});
				}
			});
		} else {
			History.find({ userId: uid }).sort({ timestamp: 'desc' }).then(history => {
				return routerRes.json(history);
			});
		}
	});
});

module.exports = router;
