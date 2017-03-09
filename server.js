// server.js
var assert = require('assert');
var express = require('express');        // call express
var app = express();                 // define our app using express
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var url = 'mongodb://ccms:ccms.15@ds043022.mongolab.com:43022/heroku_app37228477';
var database;

process.on('SIGINT', function () {
    console.log("Closing database connection");
    database.close();
    process.exit(0);
});

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    database = db;
    console.log(database);
});

var insertDocument = function(db, record, callback) {
    db.collection('webhook').insertOne(record, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the restaurants collection.");
        callback(result);
    });
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var router = express.Router();              // get an instance of the express Router
router.all('/', function(req, res) {
    console.log('req ' + req.ref);
        res.status(200).json({ message: 'success', endpoints: [
            "GET /api/taskValidationAlwaysSucceed  Always returns HTTP 200 and { 'message': 'success' }",
            "GET /api/taskValidationAlwaysFail  Always returns HTTP 400 and { 'message': 'fail' }",
            "GET /api/taskValidationRandomFail  Randomly succeeds roughly 50% of the time it is called. Fails the other 50%"
        ]
    });   
});

router.all('/taskValidation', function(req, res) {
  // do something useful here. until then always succeed
//    console.log(database);
    // database.collection('webhook').insertOne(req);

    database.collection('webhook').save(req.body, function(err, result) {
        if (err) return console.log(err)

        console.log('saved to database')

//    MongoClient.connect(url, function(err, db) {
//      assert.equal(null, err);
//      insertDocument(db, req, function() {
//          db.close();
//      });
//    });

        res.status(200).json({ message: 'success' });
    });
});

router.all('/taskValidationRandomFail', function(req, res) {
  // randomly fail 50% of the time
  var n = Math.floor(Math.random()*100) < 50;
  if(Math.floor(Math.random()*10) > 5) {
    res.status(400).json({ message: 'fail' });   
  } else {
    res.status(200).json({ message: 'success'});   
  }
});

router.all('/taskValidationAlwaysSucceed', function(req, res) {
  res.status(200).json({ message: 'success' });   
});

router.all('/taskValidationAlwaysFail', function(req, res) {
  res.status(400).json({ message: 'fail' });   
});

app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Running. Listen port: ' + port);
