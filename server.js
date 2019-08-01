const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const auth = require("./routes/auth");
const chart = require("./routes/chart");
const user = require("./routes/user");
const accounts = require("./routes/accounts");
const cronjob = require("./routes/cronjob");
const history = require("./routes/history");
const config = require("./config/config");
const mongoURI = require("./config/config").mongoURI;

// Connect to MongoDB
mongoose
	.connect(mongoURI, { useNewUrlParser: true })
	.then(() => console.log("MongoDB successfully connected"))
	.catch(err => console.log(err));
mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", config.origin);
	res.header("Access-Control-Allow-Origin", config.origin);
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Access-Control-Allow-Methods', '*');
	next();
});

// Passport middleware
app.use(passport.initialize());
require("./utils/passport")(passport);

// Routes
app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/accounts", accounts);
app.use("/api/chart", chart);
app.use("/api/cronjob", cronjob);
app.use("/api/history", history);

app.listen(config.port, () =>
	console.log(`Server up and running on port ${config.port} !`)
);