const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const verifier = require("../../config/verifier");
const User = require("../../models/User");
const messages = require("../../sheard/messages");

// @route POST api/user/accounts/update
// @access User
// api updates the users connectede accounts ids.
// TODO: should have a instructions field on how to get the id from every site.
router.post('/accounts/update', (req, routerRes) => {
    verifier(req.headers['authorization'], (verifierRes) => {
        if (!verifierRes.success) {
            return routerRes.status(400).json(verifierRes);
        }
        const uid = verifierRes.id;
        User.findOne({ _id: uid }).then(user => {
            if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
            var accounts = user.accounts;
            const newAccounts = req.body.accounts;
            Object.keys(newAccounts).forEach(key => {
                accounts[key] = newAccounts[key];
            });
            User.findOneAndUpdate({ _id: uid }, { $set: { accounts: accounts } }, { upsert: false }).then(user => {
                if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
                // TODO: should return a success message
                return routerRes.json(messages.GENERAL_SUCCESS);
            });
        });
    });
});


// @route GET api/user/accounts/get
// @access User
// api gets all users active connected accounts details.
router.get('/accounts/get', (req, routerRes) => {
    verifier(req.headers['token'], (verifierRes) => {
        console.log(verifierRes);
        
        if (!verifierRes.success) {
            return routerRes.status(400).json(verifierRes);
        }
        const uid = verifierRes.id;
        User.findOne({ _id: uid }).then(user => {
            if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
            var accounts = user.accounts;
            console.log(accounts);
            return routerRes.json(accounts);
        });
    });
});


// @route GET api/user/accounts/get
// @access User
// api return if current user is admin or not
router.get('/admin/get', (req, routerRes) => {
    verifier(req.headers['token'], (verifierRes) => {
        console.log(verifierRes);
        
        if (!verifierRes.success) {
            return routerRes.status(400).json(verifierRes);
        }
        const uid = verifierRes.id;
        User.findOne({ _id: uid }).then(user => {
            if (!user) return routerRes.status(400).json(messages.USER_NOT_FOUND_ERROR);
            var admin = user.role === 'admin';
            return routerRes.json({'admin': admin});
        });
    });
});


module.exports = router;
