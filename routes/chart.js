const express = require("express");
const HttpStatus = require('http-status-codes');

const Chart = require("../models/Chart");
const messages = require("../consts/messages");
const documents = require("../consts/documents");

const router = express.Router();


// route:  POST api/chart/get
// access: Public
// desc:   api return the current chart
router.get('/get', (req, routerRes) => {
	Chart.findOne({ _id: documents.CHART }).then(chart => {
		if (!chart) return routerRes.status(HttpStatus.INTERNAL_SERVER_ERROR).json(messages.UNKNOWN_ERROR);
		var charts = {
			'top3': chart.top3,
			'passed': chart.passed,
			'under': chart.under,
			'lastUpdated': chart.lastUpdated,
		};
		return routerRes.json(charts);
	});
});

module.exports = router;
