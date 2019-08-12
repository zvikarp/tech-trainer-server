const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpStatus = require('http-status-codes');

const config = require("../config/config");
const resData = require("../consts/resData");
const User = require("../models/User");
const validateSignupInput = require("../utils/validation/signup");
const validateSigninInput = require("../utils/validation/signin");
const mongodbUser = require("../utils/mongodb/user");

const router = express.Router();

// route:  POST api/auth/signup
// access: Public
// desc:   Signup user
router.post("/signup", async (req, res) => {
	try {
		const validateSignup = validateSignupInput(req.body);
		if (!validateSignup.success) {
			throw { status: HttpStatus.BAD_REQUEST, data: validateSignup };
		}
		const user = req.body;
		const emailNotInUse = await mongodbUser(user.email);
		if (!emailNotInUse) throw { status: HttpStatus.BAD_REQUEST, data: { success: false, messages: "Email already exists" } };
		const newUser = new User({
			name: user.name,
			email: user.email,
			password: user.password
		});
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if (err) throw err;
				newUser.password = hash;
				newUser.save()
					.then(user => { res.json(user); })
					.catch(err => { res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(resData.UNKNOWN_ERROR) });
			});
		});

	} catch (err) {

	}
});


// route:  POST api/auth/signin
// access: Public
// desc:   Signin user and return token
router.post("/signin", (req, res) => {
	const { errors, isValid } = validateSigninInput(req.body);
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
