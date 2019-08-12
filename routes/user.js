const express = require("express");
const HttpStatus = require("http-status-codes");

const resData = require("../consts/resData");
const mongodbUser = require("../utils/mongodb/user");
const mongodbSettings = require("../utils/mongodb/settings");
const validateSettingsInput = require("../utils/validation/settings");
const validateWebsites = require("../utils/validation/websites");
const verifier = require("../utils/verifier");

const router = express.Router();

// converts a `forEach` function to a async one
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

// route:  PUT api/user/accounts/:id
// access: User/Admin
// desc:   api updates the users connected accounts.
router.put("/accounts/:id", async (req, res) => {
	try {
		const user = await verifier.user(req.headers["authorization"]);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(user.id);
		await updateUserAccounts(userId, req.body.accounts);
		return res.json(resData.GENERAL_SUCCESS);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

function removeUserAccount(userAccounts, accountId) {
	delete userAccounts[accountId];
	return userAccounts;
}

// if not website -> dont need to validate, but if is then first validate account name
async function updateAndValidateUserAccount(
	userAccounts,
	serverAccount,
	newAccount,
	accountId
) {
	const isWebsite = newAccount !== "" && serverAccount.type === "website";
	const validWebsite = !isWebsite || (await validateWebsites(serverAccount.name, newAccount));
	if (validWebsite !== true && !validWebsite.success) {
		throw { status: HttpStatus.BAD_REQUEST, data: validWebsite };
	}
	userAccounts[accountId] = newAccount;
	return userAccounts;
}

async function updateAndValidateUserAccounts(
	serverAccounts,
	userAccounts,
	newAccounts
) {
	await asyncForEach(Object.keys(newAccounts), async accountId => {
		const serverAccount = serverAccounts[accountId];
		const newAccount = newAccounts[accountId];
		if (!serverAccount) {
			userAccounts = removeUserAccount(userAccounts, accountId);
		} else {
			userAccounts = await updateAndValidateUserAccount(
				userAccounts,
				serverAccount,
				newAccount,
				accountId
			);
		}
	});
	return userAccounts;
}

async function updateUserAccounts(userId, newAccounts) {
	const user = await mongodbUser.get(userId);
	const settings = await mongodbSettings.get();
	const serverAccounts = settings.accounts;
	const userAccounts = user.accounts;
	const updatedAccounts = await updateAndValidateUserAccounts(
		serverAccounts,
		userAccounts,
		newAccounts
	);
	await mongodbUser.putAccounts(userId, updatedAccounts);
}

// route:  GET api/user/accounts/:id
// access: User/Admin
// desc:   api gets the users connected accounts.
router.get("/accounts/:id", async (req, res) => {
	try {
		const user = await verifier.user(req.headers["authorization"]);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(user.id);
		const userFromDatabase = await mongodbUser.get(userId);
		const userAccounts = userFromDatabase.accounts;
		return res.json(userAccounts);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// route:  GET api/user/admin/:id
// access: Auth
// desc:   api return if current user is admin or not
router.get("/admin/:id", async (req, res) => {
	try {
		const user = await verifier.user(req.headers["authorization"]);
		const userId = req.params.id;
		const userFromDatabase = await mongodbUser.get(userId);
		var admin = userFromDatabase.role === "admin";
		return res.json({ admin: admin });
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// route:  GET api/user/:id
// access: User/Admin
// desc:   api return current user detailes
router.get("/:id", async (req, res) => {
	try {
		const user = await verifier.user(req.headers["authorization"]);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(user.id);
		const userFromDatabase = await mongodbUser.get(userId);
		return res.json(userFromDatabase);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

// route:  PUT api/user/settings/:id
// access: User/Admin
// desc:   api updates the users settings.
router.put("/settings/:id", async (req, res) => {
	try {
		const user = await verifier.user(req.headers["authorization"]);
		const userId = req.params.id;
		if (user.id !== userId) await verifier.admin(user.id);
		const validSettings = validateSettingsInput(req.body);
		if (!validSettings.success) {
			throw { status: HttpStatus.BAD_REQUEST, data: validSettings };
		}
		await updateUserSettings(userId, req.body, user.id !== userId);
		return res.json(resData.GENERAL_SUCCESS);
	} catch (err) {
		const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
		const data = err.data || resData.UNKNOWN_ERROR;
		return res.status(status).json(data);
	}
});

async function updateUserSettings(userId, body, isAdmin) {
	const user = await mongodbUser.get(userId);
	const name = body.name || user.name;
	const email = body.email || user.email;
	const bonusPoints = updateUserBonusPoints(
		user.bonusPoints,
		body.bonusPoints,
		isAdmin
	);
	await mongodbUser.putSettings(userId, name, email, bonusPoints);
}

function updateUserBonusPoints(currentBonusPoints, newBonusPpoints, isAdmin) {
	if (isAdmin) return newBonusPpoints || currentBonusPoints;
	return currentBonusPoints;
}

module.exports = router;