const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const verifier = require("../../config/verifier");
const User = require("../../models/User");
const Settings = require("../../models/Settings");
const messages = require("../../sheard/messages");
const db = require("../../config/keys").mongoURI;
const mongoose = require("mongoose");
const axios = require("axios");

async function getGithubPoints(username) {
  var res = await axios.get(
    "https://api.github.com/users/" + username + "/repos"
  );
  console.log("g points " + res.data.length);
  // return res.data.length;
  return 6;
}

async function getMediumPoints(username) {
  // the medium api returns a rss not json, so we can convert it on rss2json server:
  var res = await axios.get(
    "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@" +
      username
  );
  console.log("m points " + res.data.items.length);
  return 8;
}

async function getStackoverflowPoints(username) {
  // the medium api returns a rss not json, so we can convert it on rss2json server:
  var res = await axios.get(
    "https://api.stackexchange.com/2.2/users/" +
      username +
      "?site=stackoverflow"
  );
  console.log("s points " + res.data.items[0].reputation);
  return 12;
}

router.post("/updatepoints", async (req, routerRes) => {
  verifier(req.headers["authorization"], verifierRes => {
    if (!verifierRes.success) {
      return routerRes.status(400).json(verifierRes);
    }

    const uid = verifierRes.id;
    User.findOne({ _id: uid }).then(user => {
      if (!user)
        return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
      if (user.role != "admin")
        return routerRes.status(400).json(messages.USER_PERMISSIONS_ERROR);
      Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(accounts => {
        if (!accounts)
          return routerRes.status(400).json(messages.ACCOUNTS_NOT_FOUND);
        const accountsNames = [];
        var numberOfUsers = 0;
        Object.keys(accounts.websites).forEach(key => {
          accountsNames.push(accounts.websites[key].name);
        });
        User.find({}).then(async users => {
          await users.forEach(async user => {
            var usersPoints = 0;
            Object.keys(user.accounts).forEach(key => {
              if (accountsNames.indexOf(key) < 0);
              else if (user.accounts[key] == "");
              else {
                switch (key) {
                  case "GitHub":
                    usersPoints += getGithubPoints(user.accounts[key]);
                    break;
                  case "Medium":
                    usersPoints += getMediumPoints(user.accounts[key]);
                    break;
                  case "Stackoverflow":
                    usersPoints += getStackoverflowPoints(user.accounts[key]);
                    break;
                  default:
                    usersPoints += 0;
                    break;
                }
              }
            });
            console.log(usersPoints);
            // console.log(user.id);
            // console.log(user.points);

            var test = await User.findOneAndUpdate(
              { _id: user.id },
              { $set: { points: usersPoints } }
            ).exec();
            console.log(numberOfUsers);
            numberOfUsers++;
          });
          return routerRes.json({ test: numberOfUsers });
        });
      });
    });
  });
});

module.exports = router;
