// const mongoose = require('mongoose');
// const express = require('express');
// var cors = require('cors');
// const bodyParser = require('body-parser');
// const logger = require('morgan');
// const Data = require('./data');

// const API_PORT = 3001;
// const app = express();
// app.use(cors());
// const router = express.Router();

// // this is our MongoDB database
// const dbRoute =
//   'mongodb+srv://orange-chat:orange-chat-password-that-is-so-simple@orange-chat-0-yhdz0.mongodb.net/test?retryWrites=true&w=majority';

// // connects our back end code with the database
// mongoose.connect(dbRoute, { useNewUrlParser: true });

// let db = mongoose.connection;

// db.once('open', () => console.log('connected to the database'));

// // checks if connection with the database is successful
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// // (optional) only made for logging and
// // bodyParser, parses the request body to be a readable json format
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(logger('dev'));

// // this is our get method
// // this method fetches all available data in our database
// router.get('/getData', (req, res) => {
//   Data.find((err, data) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true, data: data });
//   });
// });

// // this is our update method
// // this method overwrites existing data in our database
// router.post('/updateData', (req, res) => {
//   const { id, update } = req.body;
//   Data.findByIdAndUpdate(id, update, (err) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true });
//   });
// });

// // this is our delete method
// // this method removes existing data in our database
// router.delete('/deleteData', (req, res) => {
//   const { id } = req.body;
//   Data.findByIdAndRemove(id, (err) => {
//     if (err) return res.send(err);
//     return res.json({ success: true });
//   });
// });

// // this is our create methid
// // this method adds new data in our database
// router.post('/putData', (req, res) => {
//     console.log("sdfgertrrtertertrehjk");
// //   let data = new Data();
//   console.log("sdfghjk");


//   const { id, message } = req.body;

// //   if ((!id && id !== 0) || !message) {
// //     return res.json({
// //       success: false,
// //       error: 'INVALID INPUTS',
// //     });
// //   }
//   data.message = message;
//   data.id = id;
//   data.save((err) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true });
//   });
// });

// // append /api for our http requests
// app.use('/api', router);

// // launch our backend into a port
// app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const helmet = require('helmet')

const CONNECTION_URL = "mongodb+srv://orange-chat:orange-chat-password-that-is-so-simple@orange-chat-0-yhdz0.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "testdatabase";

var app = Express();
app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://apis.google.com");
    return next();
});

app.use(Express.static(__dirname + '/'));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(3001, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("testcollection");
        console.log("Connected to `" + DATABASE_NAME + "`!");

        app.post("/person", (request, response) => {
            console.log("fdgdfg");

            collection.insert(request.body, (error, result) => {
                if (error) {
                    return response.status(500).send(error);
                }
                response.send(result.result);
            });
        });

        app.get("/people", (request, response) => {
            collection.find({}).toArray((error, result) => {
                if (error) {
                    return response.status(500).send(error);
                }
                response.send(result);
            });
        });
    });
});