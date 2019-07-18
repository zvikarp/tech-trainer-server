const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const verifier = require("../../config/verifier");
const Settings = require("../../models/Settings");

// @route GET api/accounts/get
// @access Authed

// api returns all types of accounts
// TODO: have the accounts and "otherFields" in seperate docs, the names would be the ids, not random strings.
// TODO: every account would have a id, so it wount depend on the name.
// TODO: change the name to something else then accounts and other stuff...
router.get("/get", (req, routerRes) => {
	routerRes.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
  verifier(req.headers['token'], (verifierRes) => {
    if (!verifierRes.success) {
      return routerRes.status(400).json(verifierRes);
    }
    Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(accounts => {
      if (accounts) {
        return routerRes.json(accounts)
      } else {
        return routerRes.status(400).json({ accounts: "invalid request" });
      }
    });
  });
});

module.exports = router;
