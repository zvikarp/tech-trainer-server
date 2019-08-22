const bcrypt = require("bcryptjs");

module.exports = passwordHasher = async (password) => {
  const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(password, salt);
	return hash
};