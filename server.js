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
const app = express();

// Bodyparser middleware
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(bodyParser.json());

// DB Config
const mongoURI = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
	.connect(
		mongoURI,
		{ useNewUrlParser: true }
	)
	.then(() => console.log("MongoDB successfully connected"))
	.catch(err => console.log(err));
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", 'https://naughty-villani-d0f667.netlify.com');
	res.setHeader('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', '*');
	res.header("Access-Control-Allow-Headers", '*');
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


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));