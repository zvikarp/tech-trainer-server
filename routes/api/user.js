const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const verifier = require("../../config/verifier");
const User = require("../../models/User");

// @route GET api/user/accounts/update
// @access Authed

// api returns all types of accounts
// TODO: have the accounts and "otherFields" in seperate docs, the names would be the ids, not random strings.
// TODO: every account would have a id, so it wount depend on the name.
// TODO: change the name to something else then accounts and other stuff...
router.post("/accounts/update", (req, routerRes) => {
    console.log(req.headers);
    
    verifier(req.headers['authorization'], (verifierRes) => {
        if (!verifierRes.success) {
            return routerRes.status(400).json(verifierRes);
        }
        const uid = verifierRes.id;
        User.findOne({ _id: uid }).then(user => {
            if (!user) return routerRes.status(400).json({ message: "error" });
            var accounts = user.accounts;
            const newAccounts = req.body.accounts;
            Object.keys(newAccounts).forEach(key => {
                accounts[key] = newAccounts[key];
            });
            User.findOneAndUpdate({ _id: uid }, { $set: { accounts: accounts } }, { upsert: false }).then(user => {
                if (!user) return routerRes.status(400).json({ message: "error" });
            });
        });
    });
});

module.exports = router;
