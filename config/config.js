const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	mongoURI: process.env.MONGO_URI,
	origin: process.env.ORIGIN,
	key: process.env.KEY,
	port: process.env.PORT,
};