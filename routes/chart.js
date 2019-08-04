const express = require("express");
const HttpStatus = require('http-status-codes');

const messages = require("../consts/messages");
const mongodbChart = require("../utils/mongodb/chart");

const router = express.Router();

// route:  GET api/chart/
// access: Public
// desc:   api return the current chart
router.get('/', async (req, res) => {
	try {
		const chart = await mongodbChart.get();
		return res.json(chart);
	} catch (err) {		
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const message = err.message || messages.UNKNOWN_ERROR;
		return res.status(status).json(message);
	}
});

module.exports = router;
