const express = require("express");
const HttpStatus = require('http-status-codes');

const mongodbHistory = require("../utils/mongodb/history");
const verifier = require("../utils/auth/verifier");
const consts = require("../consts/consts");

const router = express.Router();

// route:  GET api/history/:id
// access: User/Admin
// desc:   api gets user history
router.get('/:id', async (req, res) => {
	try {
		const user = await verifier.user(req.headers[consts.AUTH_HEADER]);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(req.headers[consts.AUTH_HEADER]);
		const historyArray = await mongodbHistory.getByUserId(userId);
		return res.json(historyArray);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// TODO: move history add (and update) to here
// TODO: when user edits history, make it change the last, not create a new one
// TODO: when user signs up, add him to chart and create history 

module.exports = router;
