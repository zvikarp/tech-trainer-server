const express = require("express");
const router = express.Router();
const userVerifier = require("../../config/userVerifier");
const History = require("../../models/History");

// @route GET api/history/get
// @access User?
// api gets all users active connected accounts details.
router.get('/get', (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers['token'], (verifierRes) => {

		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		var uid = verifierRes.id;
		console.log(req.headers);
		
		if (req.headers['userid']) {
			uid = req.headers['userid'];
		}
		History.find({ userId: uid }).sort({timestamp: 'desc'}).then(history => {			
			return routerRes.json(history);
		});
	});
});

module.exports = router;
