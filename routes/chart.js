const express = require("express");
const HttpStatus = require('http-status-codes');
const axios = require("axios");

const websitesGithub = require("../utils/websites/github");
const apiCall = require("../utils/websites/apiCall");
const websitesMedium = require("../utils/websites/medium");
const websitesStackoverflow = require("../utils/websites/stackoverflow");
const websitesWikipedia = require("../utils/websites/wikipedia");
const resData = require("../consts/resData");
const User = require("../models/User");
const History = require("../models/History");
const verifier = require("../utils/verifier");
const mongodbUser = require("../utils/mongodb/user");
const mongodbSettings = require("../utils/mongodb/settings");
const mongodbChart = require("../utils/mongodb/chart");
const mongodbHistory = require("../utils/mongodb/history");
const consts = require("../consts/consts");

const router = express.Router();

// converts a `forEach` function to a async one
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function getUsersPoints(user, accounts, shouldCreateNew = false) {
	var userPoints = {};
	user.points = 0;

	console.log(user.accounts);
	

	await asyncForEach(Object.keys(user.accounts), async key => {
		if (!accounts[key]);
		else if (accounts[key].type !== "website");
		else if (user.accounts[key] == "");
		else {
			switch (accounts[key].name) {
				case "GitHub":
					const githubPoints = (await apiCall.get("https://api.github.com/users/", user.accounts[key], "/repos", ".length")) * accounts[key].points;
					// const githubPoints = (await websitesGithub.get(user.accounts[key])) * accounts[key].points;
					console.log(githubPoints);
					
					user.points = user.points + githubPoints;
					if (githubPoints > 0) {
						userPoints.github = githubPoints;
					}
					break;
				case "Medium":
					const mediumPoints = (await websitesMedium.get(user.accounts[key])) * accounts[key].points;
					user.points = user.points + mediumPoints;
					if (mediumPoints > 0) {
						userPoints.medium = mediumPoints;
					}
					break;
				case "Stackoverflow":
					const stackoverflowPoints = (await websitesStackoverflow.get(user.accounts[key])) * accounts[key].points;
					user.points = user.points + stackoverflowPoints;
					if (stackoverflowPoints > 0) {
						userPoints.stackoverflow = stackoverflowPoints;
					}
					break;
				case "Wikipedia":
					const wikipediaPoints = (await websitesWikipedia.get(user.accounts[key])) * accounts[key].points;
					user.points = user.points + wikipediaPoints;
					if (wikipediaPoints > 0) {
						userPoints.wikipedia = wikipediaPoints;
					}
					break;
				default:
					user.points += 0;
					break;
			}
		}
	});
	
	console.log(userPoints.github);
	userPoints['bonus points'] = user.bonusPoints;

	user.points += user.bonusPoints;
	await mongodbUser.putPoints(user.id, user.points);
	const userHistory = new History({
		userId: user.id,
		timestamp: Date.now(),
		points: user.points,
		accounts: userPoints
	});
	if (shouldCreateNew)
		await mongodbHistory.post(userHistory);
	else
		await mongodbHistory.putInLastByUserId(userHistory);
	return {
		id: user.id,
		name: user.name,
		points: user.points
	};
}

// route:  POST api/chart/
// access: Admin
// desc:   api re-calcs the top chart
router.post("/", async (req, res) => {
	try {
		await verifier.admin(req.headers[consts.AUTH_HEADER]);
		const settings = await mongodbSettings.get();
		const users = await mongodbUser.getAll();
		const accounts = settings.accounts;
		const chart = await getChart(users, accounts);
		const newChart = new Chart({
			users: chart,
			timestamp: Date.now()
		});
		await mongodbChart.post(newChart);
		return res.json(resData.GENERAL_SUCCESS);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// remove user by id from array
function removeUserFromArrayById(array, id) {
	return array.filter(function (child) {
		return child.id !== id;
	});
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
router.get('/last', async (req, res) => {
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
router.get('/', async (req, res) => {
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
