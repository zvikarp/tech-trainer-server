const express = require("express");
const router = express.Router();
const Chart = require("../../models/Chart");
const messages = require("../../sheard/messages");

// @route POST api/chart/get
// @access Public
// api return the current chart
router.get('/get', (req, routerRes) => {

	Chart.findOne({ _id: "5d2ed28f1c9d440000552aaa" }).then(chart => {
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
