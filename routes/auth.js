const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const keys = require("../config/keys");
const User = require("../models/User");
const validateRegisterInput = require("../utils/validation/register");
const validateLoginInput = require("../utils/validation/login");
const messages = require("../consts/messages");
const statusCodes = require("../consts/statusCodes");

// route:  POST api/auth/register
// access: Public
// desc:   Register user
router.post("/register", (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	const { errors, isValid } = validateRegisterInput(req.body);
	if (!isValid) {
		return res.status(statusCodes.FORBIDDEN).json(errors);
	}
	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
			return res.status(statusCodes.BAD_REQUEST).json({ email: "Email already exists" });
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
						.catch(err => {res.status(statusCodes.INTERNAL_SERVER_ERROR).json(messages.UNKNOWN_ERROR)});
				});
			});
		}
	});
});


// route:  POST api/auth/login
// access: Public
// desc:   login user and return token
router.post("/login", (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	const { errors, isValid } = validateLoginInput(req.body);
	if (!isValid) {
		return res.status(statusCodes.FORBIDDEN).json(errors);
	}
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({ email }).then(user => {
		if (!user) {
			return res.status(statusCodes.BAD_REQUEST).json({ emailnotfound: "Email not found" });
		}
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				const payload = {
					id: user.id,
					name: user.name
				};
				jwt.sign(
					payload,
					keys.key,
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
				return res.status(statusCodes.BAD_REQUEST).json({ passwordincorrect: "Password incorrect" });
			}
		});
	});
});

module.exports = router;
