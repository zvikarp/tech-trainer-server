const express = require("express");
const HttpStatus = require('http-status-codes');

const mongodbHistory = require("../utils/mongodb/history");
const userVerifier = require("../utils/verifiers/userVerifier");
const adminVerifier = require("../utils/verifiers/adminVerifier");
const verifier = require("../utils/verifier");

const router = express.Router();

// route:  GET api/history/get
// access: User/Admin
// desc:   api gets user history
router.get('/get', async (req, res) => {
	try {
		const user = await verifier.user(req.headers['token']);
		var userId = user.id;
		if ((req.headers['userid'] != "undefined") && (req.headers['userid'] != undefined)) {
			await verifier.admin(req.headers['token']);
			userId = req.headers['userid'];
		}
		const historyArray = await mongodbHistory.getByUserId(userId);		
		return res.json(historyArray);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const message = err.message || messages.UNKNOWN_ERROR;
		return res.status(status).json(message);
	}
});

module.exports = router;
