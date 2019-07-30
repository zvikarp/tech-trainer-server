const express = require("express");
const HttpStatus = require('http-status-codes');

const mongodbHistory = require("../utils/mongodb/history");
const verifier = require("../utils/verifier");

const router = express.Router();

// route:  GET api/history/:id
// access: User/Admin
// desc:   api gets user history
router.get('/:id', async (req, res) => {
	try {
		const user = await verifier.user(req.headers['token']);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(user.id);
		const historyArray = await mongodbHistory.getByUserId(userId);
		return res.json(historyArray);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const message = err.message || messages.UNKNOWN_ERROR;
		return res.status(status).json(message);
	}
});

module.exports = router;
