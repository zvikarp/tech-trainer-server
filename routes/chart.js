const express = require("express");
const HttpStatus = require('http-status-codes');

const resData = require("../consts/resData");
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
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

module.exports = router;
