const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const auth = require("./routes/api/auth");
const chart = require("./routes/api/chart");
const user = require("./routes/api/user");
const accounts = require("./routes/api/accounts");
const cronjob = require("./routes/api/cronjob");
const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

// Passport middleware
app.use(passport.initialize());
require("./config/passport")(passport);

// Routes
app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/accounts", accounts);
app.use("/api/chart", chart);
app.use("/api/cronjob", cronjob);
// app.use(function(req, res, next) {
// 	res.header('Access-Control-Allow-Origin', 'https://naughty-villani-d0f667.netlify.com');
// 	next();
// });

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", '*');
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
	next();
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));