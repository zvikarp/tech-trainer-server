const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const verifier = require("../../config/verifier");

// @route GET api/accounts/get
// @desc return accounts types
// @access Public

const Settings = require("../../models/Settings");

router.get("/get", (req, res) => {
  verifier(req.headers['token'], (res) => {
    if (!res.success) {
      return res.status(400).json({ success: false, message: 'Valid auth token is required' });
    }
    console.log(res);
  });

  Settings.findOne({ _id: "5d2b22ac1c9d4400006d66ef" }).then(accounts => {

    if (accounts) {
      return res.json(accounts)
    } else {
      return res.status(400).json({ accounts: "invalid request" });

    }
  });
});

module.exports = router;
