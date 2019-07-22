const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const userVerifier = require("../../config/userVerifier");
const User = require("../../models/User");
const Settings = require("../../models/Settings");
const Chart = require("../../models/Chart");
const History = require("../../models/History");
const messages = require("../../sheard/messages");
const db = require("../../config/keys").mongoURI;
const mongoose = require("mongoose");
const axios = require("axios");

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

async function getMediumPoints(username) {
	// the medium api returns a rss not json, so we can convert it on rss2json server:
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

async function getStackoverflowPoints(username) {
	// the medium api returns a rss not json, so we can convert it on rss2json server:
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

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

function sortUsersByPoints(a, b) {
	if (a.points > b.points) return -1;
	return 1;
}

router.post("/updatepoints", async (req, routerRes) => {
	// routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	userVerifier(req.headers["authorization"], verifierRes => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		return User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			if (user.role != "admin") return routerRes.status(400).json(messages.USER_PERMISSIONS_ERROR);
			return Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(settings => {
				if (!settings) return routerRes.status(400).json(messages.ACCOUNTS_NOT_FOUND);
				// const accountsNames = [];
				// Object.keys(accounts.websites).forEach(key => {
				// 	accountsNames.push(accounts.websites[key].name);
				// });
				return User.find({}).then(async (users) => {
					const passingPoints = 50;
					var chart = {
						'top3': [],
						'passed': [],
						'under': []
					};
					const accounts = settings.accounts;
					await asyncForEach(users, async (user) => {
						var userPoints = {};
						user.points = 0;
						await asyncForEach(Object.keys(user.accounts), async (key) => {
							if (!accounts[key]);
							else if (accounts[key].type !== "website");
							// if (accountsNames.indexOf(key) < 0);
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
						const userHistory = new History({
							userId: user.id,
							timestamp: Date.now(),
							points: user.points,
							accounts: userPoints,
						});
						await userHistory.save();
						userObject = {
							'id': user.id,
							'name': user.name,
							'points': user.points
						};
						if (user.points > passingPoints) {
							chart.passed.push(userObject);
						} else {
							chart.under.push(userObject);
						}
					});
					chart.passed.sort(sortUsersByPoints);
					chart.under.sort(sortUsersByPoints);
					chart.top3 = chart.passed.splice(0, 3);

					await Chart.findOneAndUpdate({ _id: "5d2ed28f1c9d440000552aaa" }, { $set: { top3: chart.top3, passed: chart.passed, under: chart.under, lastUpdated: Date.now() } }, { upsert: true }).exec();

					return routerRes.json({ test: 'success' });
				});
			});
		});
	});
});

module.exports = router;
