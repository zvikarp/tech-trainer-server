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
const passwordHasher = require("../utils/auth/passwordHasher");

const router = express.Router();

// route:  POST api/auth/signup
// access: Public
// desc:   signup user
router.post("/signup", async (req, res) => {
	try {
		const user = req.body;
		const validateSignup = validateSignupInput(user);
		if (!validateSignup.success) {
			throw { status: HttpStatus.BAD_REQUEST, data: validateSignup };
		}
		const emailInUse = await mongodbUser.checkIfExistsByEmail(user.email);
		if (emailInUse) throw { status: HttpStatus.BAD_REQUEST, data: resData.EMAIL_EXISTS };
		const newUser = new User({
			name: user.name,
			email: user.email,
			password: user.password,
			role: 'user' // PROD-NOTE: remove this line in produnction
		});
		newUser.password = await passwordHasher(newUser.password);
		await mongodbUser.post(newUser); // TODO: move to user mongoose file
		return signin(user.email, user.password, res);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});


// route:  POST api/auth/signin
// access: Public
// desc:   signin user and return token
router.post("/signin", async (req, res) => {
	try {
		const user = req.body;
		const validateSignin = validateSigninInput(user);
		if (!validateSignin.success) {
			throw { status: HttpStatus.BAD_REQUEST, data: validateSignin };
		}
		return signin(user.email, user.password, res);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

async function signin(email, password, res) {
	try {
		
		const emailExists = await mongodbUser.checkIfExistsByEmail(email);
		if (!emailExists) throw { status: HttpStatus.BAD_REQUEST, data: resData.EMAIL_NOT_FOUND };
		const userFromDatabase = await mongodbUser.getByEmail(email); // TODO: can merge this with the one above
		passwordMatch = await bcrypt.compare(password, userFromDatabase.password);
		if (!passwordMatch) throw { status: HttpStatus.BAD_REQUEST, data: resData.PASSWORD_INCORRECT };
		const payload = {
			id: userFromDatabase.id,
			name: userFromDatabase.name,
			role: userFromDatabase.role,
		};
		const token = await jwt.sign(payload, config.key, { expiresIn: 31556926 });
		return res.json({
			success: true,
			token: "Bearer " + token
		});
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
}

module.exports = router;
