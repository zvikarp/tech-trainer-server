const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpStatus = require('http-status-codes');

const config = require("../config/config");
const messages = require("../consts/messages");
const User = require("../models/User");
const validateRegisterInput = require("../utils/validation/register");
const validateLoginInput = require("../utils/validation/login");

const router = express.Router();

// route:  POST api/auth/register
// access: Public
// desc:   Register user
router.post("/register", (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body);
	if (!isValid) {
		return res.status(HttpStatus.FORBIDDEN).json(errors);
	}
	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
			return res.status(HttpStatus.BAD_REQUEST).json({ email: "Email already exists" });
		} else {
			const newUser = new User({
				name: req.body.name,
				chats: [],
				email: req.body.email,
				password: req.body.password
			});
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) throw err;
					newUser.password = hash;
					newUser.save()
						.then(user => {res.json(user);})
						.catch(err => {res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(messages.UNKNOWN_ERROR)});
				});
			});
		}
	});
});


// route:  POST api/auth/login
// access: Public
// desc:   login user and return token
router.post("/login", (req, res) => {
	const { errors, isValid } = validateLoginInput(req.body);
	if (!isValid) {
		return res.status(HttpStatus.FORBIDDEN).json(errors);
	}
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({ email }).then(user => {
		if (!user) {
			return res.status(HttpStatus.BAD_REQUEST).json({ emailnotfound: "Email not found" });
		}
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				const payload = {
					id: user.id,
					name: user.name,
					role: user.role,
				};
				jwt.sign(
					payload,
					config.key,
					{
						expiresIn: 31556926 // 1 year in seconds
					},
					(err, token) => {
						res.json({
							success: true,
							token: "Bearer " + token
						});
					}
				);
			} else {
				return res.status(HttpStatus.BAD_REQUEST).json({ passwordincorrect: "Password incorrect" });
			}
		});
	});
});

module.exports = router;
