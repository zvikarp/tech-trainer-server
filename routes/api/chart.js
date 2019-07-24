const express = require("express");
const router = express.Router();
const Chart = require("../../models/Chart");
const messages = require("../../sheard/messages");
const documents = require("../../sheard/documents");

// @route POST api/chart/get
// @access Public
// api return the current chart
router.get('/get', (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	Chart.findOne({ _id: documents.CHART }).then(chart => {
		if (!chart) return routerRes.status(400).json(messages.UNKNOWN_ERROR);
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
