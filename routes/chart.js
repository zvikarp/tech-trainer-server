const express = require("express");
const HttpStatus = require('http-status-codes');
const axios = require("axios");

const resData = require("../consts/resData");
const User = require("../models/User");
const History = require("../models/History");
const verifier = require("../utils/verifier");
const mongodbUser = require("../utils/mongodb/user");
const mongodbSettings = require("../utils/mongodb/settings");
const mongodbChart = require("../utils/mongodb/chart");
const consts = require("../consts/consts");

const router = express.Router();
const passingPoints = 50;

// gets the users repos from github via APIs
async function getGithubPoints(username) {
	try {
		var res = await axios.get(
			"https://api.github.com/users/" + username + "/repos"
		);
		return res.data.length;
	} catch (error) {
		return 0;
	}
}

// gets the users articels from medium via APIs
async function getMediumPoints(username) {
	try {
		var res = await axios.get(
			"https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@" +
				username
		);
		return res.data.items.length;
	} catch (error) {
		return 0;
	}
}

// gets the users points from stackoverflow via APIs
async function getStackoverflowPoints(username) {
	try {
		var res = await axios.get(
			"https://api.stackexchange.com/2.2/users/" +
				username +
				"?site=stackoverflow"
		);
		return res.data.items[0].reputation;
	} catch (error) {
		return 0;
	}
}

// converts a `forEach` function to a async one
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function getUsersPoints(user, accounts) {
	var userPoints = {};
	user.points = 0;

	await asyncForEach(Object.keys(user.accounts), async key => {
		if (!accounts[key]);
		else if (accounts[key].type !== "website");
		else if (user.accounts[key] == "");
		else {
			switch (accounts[key].name) {
				case "GitHub":
					const githubPoints =
						(await getGithubPoints(user.accounts[key])) * accounts[key].points;
					user.points = user.points + githubPoints;
					if (githubPoints > 0) {
						userPoints.github = githubPoints;
					}
					break;
				case "Medium":
					const mediumPoints =
						(await getMediumPoints(user.accounts[key])) * accounts[key].points;
					user.points = user.points + mediumPoints;
					if (mediumPoints > 0) {
						userPoints.medium = mediumPoints;
					}
					break;
				case "Stackoverflow":
					const stackoverflowPoints =
						(await getStackoverflowPoints(user.accounts[key])) *
						accounts[key].points;
					user.points = user.points + stackoverflowPoints;
					if (stackoverflowPoints > 0) {
						userPoints.stackoverflow = stackoverflowPoints;
					}
					break;
				default:
					user.points += 0;
					break;
			}
		}
		userPoints.points = user.points;
		return userPoints;
	});

	// TODO: the next line shouldnt be here
	await User.findOneAndUpdate(
		{ _id: user.id },
		{ $set: { points: user.points } }
	).exec();
	user.points += user.bonusPoints;
	const userHistory = new History({
		userId: user.id,
		timestamp: Date.now(),
		points: user.points,
		accounts: userPoints
	});
	await userHistory.save(); //TODO: and this one
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
	return array.filter(function(child) {
		return child.id !== id;
	});
}

async function getChart(users, accounts) {
	var chart = [];
	await asyncForEach(users, async user => {
		const userObject = await getUsersPoints(user, accounts);
		chart.push(userObject);
	});
	return chart;
}

// route:  PUT api/chart/last/:id
// access: User
// desc:   api updates a specific users points in last chart
router.put("/last/:id", async (req, res) => {
	try {
		await verifier.user(req.headers[consts.AUTH_HEADER]);
		const userId = req.params.id;
		const user = await mongodbUser.get(userId);
		const settings = await mongodbSettings.get();
		const accounts = settings.accounts;
		const updatedChart = await updateChart(user, accounts);		
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
	const userObject = await getUsersPoints(user, accounts);
	
	chart = removeUserFromArrayById(chart, user.id);
	chart.push(userObject);
	return chart;
}

// route:  GET api/chart/
// access: Public
// desc:   api return the current chart
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

module.exports = router;
