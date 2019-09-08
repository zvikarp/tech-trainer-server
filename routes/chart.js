const express = require("express");
const HttpStatus = require("http-status-codes");
import schedule from "node-schedule";

const websitesApi = require("../utils/websites/api");
const resData = require("../consts/resData");
const History = require("../models/History");
const verifier = require("../utils/auth/verifier");
const mongodbUser = require("../utils/mongodb/user");
const mongodbSettings = require("../utils/mongodb/settings");
const mongodbChart = require("../utils/mongodb/chart");
const mongodbHistory = require("../utils/mongodb/history");
const consts = require("../consts/consts");

const router = express.Router();

schedule.scheduleJob("0 0 * * *", () => calcChart());

// converts a `forEach` function to a async one
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function getUsersPoints(user, accounts, shouldCreateNew) {
	var userPointsPerAccount = {};
	var pointsSum = 0;

	await asyncForEach(Object.keys(user.accounts), async key => {
		const account = accounts[key];
		if (!account) return;
		const userAccount = user.accounts[key];
		var pointsToAdd = 0;
		switch (account.type) {
			case "list":
				if (userAccount !== "") {
					const numberOfItems = userAccount.split(",").length;
					console.log(numberOfItems);

					pointsToAdd = numberOfItems * account.points;
				}
				break;
			case "string":
				if (userAccount !== "") {
					pointsToAdd = account.points * 1;
				}
				break;
			case "number":
				if (userAccount > 0) {
					pointsToAdd = userAccount * account.points;
				}
				break;
			case "api":
				const userPointFromApi = await websitesApi.get(
					account.prefix,
					userAccount,
					account.suffix,
					account.path
				);
				pointsToAdd = userPointFromApi * account.points;
				break;
			default:
				break;
		}

		userPointsPerAccount[account.name] = pointsToAdd;
		pointsSum += pointsToAdd;
	});

	userPointsPerAccount["bonus points"] = user.bonusPoints;
	pointsSum += user.bonusPoints;

	await mongodbUser.putPoints(user.id, pointsSum);
	const userHistory = new History({
		userId: user.id,
		timestamp: Date.now(),
		points: pointsSum,
		accounts: userPointsPerAccount
	});
	if (shouldCreateNew) await mongodbHistory.post(userHistory);
	else await mongodbHistory.putInLastByUserId(userHistory);
	return {
		id: user.id,
		name: user.name,
		points: pointsSum
	};
}

// route:  POST api/chart/
// access: Admin
// desc:   api re-calcs the top chart
router.post("/", async (req, res) => {
	try {
		await verifier.admin(req.headers[consts.AUTH_HEADER]);
		await calcChart();
		return res.json(resData.GENERAL_SUCCESS);
	} catch (err) {
		console.log(err);

		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// remove user by id from array
function removeUserFromArrayById(array, id) {
	return array.filter(function(child) {
		return child.id !== id;
	});
}

async function calcChart() {
	const settings = await mongodbSettings.get();
	const users = await mongodbUser.getAll();
	const accounts = settings.accounts;
	const chart = await getChart(users, accounts);
	const newChart = new Chart({
		users: chart,
		timestamp: Date.now()
	});
	await mongodbChart.post(newChart);
}

async function getChart(users, accounts) {
	var chart = [];
	await asyncForEach(users, async user => {
		const userObject = await getUsersPoints(user, accounts, true);
		chart.push(userObject);
	});
	return chart;
}

// route:  PUT api/chart/last/:id
// access: Auth
// desc:   api updates a specific users points in last chart
router.put("/last/:id", async (req, res) => {
	try {
		await verifier.user(req.headers[consts.AUTH_HEADER]);
		const userId = req.params.id;
		const user = await mongodbUser.get(userId);
		const settings = await mongodbSettings.get();
		const accounts = settings.accounts;
		const chart = await updateChart(user, accounts);
		const updatedChart = new Chart({
			users: chart,
			timestamp: Date.now()
		});
		await mongodbChart.putLast(updatedChart);
		return res.json(resData.GENERAL_SUCCESS);
	} catch (err) {
		console.log(err);

		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

async function updateChart(user, accounts) {
	const returndChart = await mongodbChart.getLast();

	var chart = Array.prototype.slice.call(returndChart.users);
	const userObject = await getUsersPoints(user, accounts, false);

	chart = removeUserFromArrayById(chart, user.id);
	chart.push(userObject);
	return chart;
}

// route:  GET api/chart/last
// access: Public
// desc:   api return the last chart
router.get("/last", async (req, res) => {
	try {
		const chart = await mongodbChart.getLast();
		return res.json(chart);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// route:  GET api/chart/
// access: Admin
// desc:   api return all charts (last 25)
router.get("/", async (req, res) => {
	try {
		await verifier.admin(req.headers[consts.AUTH_HEADER]);
		const chart = await mongodbChart.get();
		return res.json(chart);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

module.exports = router;
