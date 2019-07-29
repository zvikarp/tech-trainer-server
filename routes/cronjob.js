const express = require("express");
const router = express.Router();
const axios = require("axios");

const userVerifier = require("../utils/userVerifier");
const User = require("../models/User");
const Settings = require("../models/Settings");
const Chart = require("../models/Chart");
const History = require("../models/History");
const messages = require("../consts/messages");
const documents = require("../consts/documents");
const statusCodes = require("../consts/statusCodes");


// gets the users repos from github via APIs
async function getGithubPoints(username) {
	try {
		var res = await axios.get("https://api.github.com/users/" + username + "/repos");
		return res.data.length;
	} catch (error) {
		return 0;
	}
}

// gets the users articels from medium via APIs
async function getMediumPoints(username) {
	try {
		var res = await axios.get("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@" + username);
		return res.data.items.length;
	} catch (error) {
		return 0;
	}
}

// gets the users points from stackoverflow via APIs
async function getStackoverflowPoints(username) {
	try {
		var res = await axios.get("https://api.stackexchange.com/2.2/users/" + username + "?site=stackoverflow");
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

// sort by points of user in array
function sortUsersByPoints(a, b) {
	if (a.points > b.points) return -1;
	return 1;
}

// remove user by id from array
	function removeUserFromArrayById(array, id) {
		return array.filter(function (child) {
			return child.id !== id;
		});
	}

async function getUsersPoints(user, accounts) {

	var userPoints = {};
	user.points = 0;

	await asyncForEach(Object.keys(user.accounts), async (key) => {

		if (!accounts[key]);
		else if (accounts[key].type !== "website");
		else if (user.accounts[key] == "");

		else {
			switch (accounts[key].name) {
				case "GitHub":
					const githubPoints = (await getGithubPoints(user.accounts[key]) * accounts[key].points);
					user.points = user.points + githubPoints;
					if (githubPoints > 0) {
						userPoints.github = githubPoints;
					}
					break;
				case "Medium":
					const mediumPoints = (await getMediumPoints(user.accounts[key]) * accounts[key].points);
					user.points = user.points + mediumPoints;
					if (mediumPoints > 0) {
						userPoints.medium = mediumPoints;
					}
					break;
				case "Stackoverflow":
					const stackoverflowPoints = (await getStackoverflowPoints(user.accounts[key]) * accounts[key].points);
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
	});
	
	await User.findOneAndUpdate(
		{ _id: user.id },
		{ $set: { points: user.points } }
	).exec();
	user.points += user.bonusPoints;
	const userHistory = new History({
		userId: user.id,
		timestamp: Date.now(),
		points: user.points,
		accounts: userPoints,
	});
	await userHistory.save();
	return {
		'id': user.id,
		'name': user.name,
		'points': user.points
	};
}


// route:  POST api/cronjob/updatepoints
// access: Admin
// desc:   api re-calcs the top chart
router.post("/updatepoints", async (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers["authorization"], verifierRes => {
		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		}
		const uid = verifierRes.id;
		return User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(statusCodes.BAD_REQUEST).json(messages.USER_NOT_FOUND_ERROR);
			if (user.role != "admin") return routerRes.status(statusCodes.FORBIDDEN).json(messages.USER_PERMISSIONS_ERROR);
			return Settings.findOne({ _id: documents.ACCOUNTS }).then(settings => {
				if (!settings) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.DOCUMENT_NOT_FOUND);
				return User.find({}).then(async (users) => {
					const passingPoints = 50;
					var chart = {
						'top3': [],
						'passed': [],
						'under': []
					};
					const accounts = settings.accounts;
					await asyncForEach(users, async (user) => {
						const userObject = await getUsersPoints(user, accounts);
						if (user.points > passingPoints) {
							chart.passed.push(userObject);
						} else {
							chart.under.push(userObject);
						}
					});
					chart.passed.sort(sortUsersByPoints);
					chart.under.sort(sortUsersByPoints);
					chart.top3 = chart.passed.splice(0, 3);

					await Chart.findOneAndUpdate({ _id: documents.CHART }, { $set: { top3: chart.top3, passed: chart.passed, under: chart.under, lastUpdated: Date.now() } }, { upsert: true }).exec();

					return routerRes.json({ test: 'success' });
				});
			});
		});
	});
});

// route:  POST api/cronjob/updateuserpoints
// access: User
// desc:   api re-calcs the top chart by just calculating one user
router.post("/updateuserspoints", async (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers["authorization"], verifierRes => {
		if (!verifierRes.success) {
			return routerRes.status(statusCodes.FORBIDDEN).json(verifierRes);
		}
		const uid = verifierRes.id;
		return User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.USER_NOT_FOUND_ERROR);
			return Settings.findOne({ _id: documents.ACCOUNTS }).then(settings => {
				return Chart.findOne({ _id: documents.CHART }).then(async (recivedChart) => {
					if (!settings) return routerRes.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.DOCUMENT_NOT_FOUND);
					const passingPoints = 50;
					var chart = {
						'top3': [],
						'passed': [...recivedChart.top3, ...recivedChart.passed],
						'under': recivedChart.under,
					};
					chart.passed = removeUserFromArrayById(chart.passed, uid);
					chart.under = removeUserFromArrayById(chart.under, uid);
					const accounts = settings.accounts;
					const userObject = await getUsersPoints(user, accounts);
					if (user.points > passingPoints) {
						chart.passed.push(userObject);
					} else {
						chart.under.push(userObject);
					}
					chart.passed.sort(sortUsersByPoints);
					chart.under.sort(sortUsersByPoints);
					chart.top3 = chart.passed.splice(0, 3);
					await Chart.findOneAndUpdate({ _id: documents.CHART }, { $set: { top3: chart.top3, passed: chart.passed, under: chart.under, lastUpdated: Date.now() } }, { upsert: true }).exec();
					return routerRes.json({ test: 'success' });
				});
			});
		});
	});
});

module.exports = router;
