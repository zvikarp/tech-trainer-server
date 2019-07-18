const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const verifier = require("../../config/verifier");
const User = require("../../models/User");
const Settings = require("../../models/Settings");
const Chart = require("../../models/Chart");
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
	verifier(req.headers["authorization"], verifierRes => {
		if (!verifierRes.success) {
			return routerRes.status(400).json(verifierRes);
		}
		const uid = verifierRes.id;
		return User.findOne({ _id: uid }).then(user => {
			if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
			if (user.role != "admin") return routerRes.status(400).json(messages.USER_PERMISSIONS_ERROR);
			return Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(recivedAccounts => {
				if (!recivedAccounts) return routerRes.status(400).json(messages.ACCOUNTS_NOT_FOUND);
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
					const accounts = recivedAccounts._doc;
					await asyncForEach(users, async (user) => {
						user.points = 0;
						await asyncForEach(Object.keys(user.accounts), async (key) => {
							if (!accounts[key]);
							else if (accounts[key].type !== "website");
							// if (accountsNames.indexOf(key) < 0);
							else if (user.accounts[key] == "");
							else {
								switch (accounts[key].name) {
									case "GitHub":
										user.points = user.points + (await getGithubPoints(user.accounts[key]) * accounts[key].points);
										break;
									case "Medium":
										user.points = user.points + (await getMediumPoints(user.accounts[key]) * accounts[key].points);
										break;
									case "Stackoverflow":
										user.points = user.points + (await getStackoverflowPoints(user.accounts[key]) * accounts[key].points);
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
