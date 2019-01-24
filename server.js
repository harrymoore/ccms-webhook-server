// server.js
var assert = require('assert');
var express = require('express'); // call express
var app = express(); // define our app using express
var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var bodyParser = require('body-parser');

// var url = 'mongodb://ccms:ccms.15@ds043022.mongolab.com:43022/heroku_app37228477';
var default_url = 'mongodb://heroku_app37228477:lr5mei2e13o4cgorhhe2vpj1jp@ds043022.mongolab.com';
var default_port = 27017;
var default_name = "heroku_app37228477";

var db_url = process.env['MONGODB_URI'];
var db_name = process.env['MONGO_NAME'] || default_name;
console.log("db address: " + db_url);
var database;

var COLLECTION_NAME = "webhook";

var endpoints = [
    "GET /api  List endpoints and recent requests",
    "POST /api/touch  save the POSTed form data",
    "GET /api/touch  save the request data",
    "GET /api/taskValidationAlwaysSucceed  Always returns HTTP 200 and { 'message': 'success' }",
    "GET /api/taskValidationAlwaysFail  Always returns HTTP 400 and { 'message': 'fail' }",
    "GET /api/taskValidationRandomFail  Randomly succeeds roughly 50% of the time it is called. Fails the other 50%"
];

process.on('SIGINT', function () {
    console.log("Closing database connection");
    database.close();
    process.exit(0);
});

// var mongoclient = new MongoClient(new Server(db_url), {native_parser: true});
MongoClient.connect(db_url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    database = client.db(db_name);
    console.log(database);
});

var insertDocument = function (db, record, callback) {
    db.collection(COLLECTION_NAME).insertOne(record, function (err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the restaurants collection.");
        callback(result);
    });
};

var recentRequests = function (db, callback) {
    // Get the documents collection
    var collection = db.collection(COLLECTION_NAME);

    // Find some documents
    collection.find().sort({
        timestamp: -1
    }).limit(10).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        callback(docs);
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var port = process.env.PORT || 8080; // set our port

var help = function (req, res) {
    console.log('req ' + req.ref);
    recentRequests(database, function (docs) {
        res.status(200).json({
            message: 'success',
            endpoints: endpoints,
            recentRequests: docs || []
        });
    });
}

var clear = function (req, res) {
    console.log('req ' + req.ref);
    var collection = database.collection(COLLECTION_NAME);

    // Find some documents
    collection.deleteMany({}, function (err) {
        assert.equal(err, null);
        console.log("Deleted records");

        res.status(200).json({
            message: 'success'
        });

    });
}

var router = express.Router(); // get an instance of the express Router
router.get('/', help);

router.all('/touch', function (req, res) {

    database.collection(COLLECTION_NAME).save({
        "timestamp": new Date(),
        "method": req.method,
        "url": req.originalUrl,
        "ip": req.ip,
        "hostname": req.hostname || "",
        "body": req.body || {},
        "params": req.params || {},
        "headers": req.headers || {}
    }, function (err, result) {
        if (err) {
            return console.log(err);
        }

        console.log('saved to database');
        res.status(200).json({
            message: 'success'
        });
    });
});

router.all('/taskValidation', function (req, res) {

    database.collection(COLLECTION_NAME).save({
        "method": req.method,
        "url": req.originalUrl,
        "ip": req.ip,
        "hostname": req.hostname || "",
        "body": req.body || {}
    }, function (err, result) {
        if (err) {
            return console.log(err);
        }

        console.log('saved to database');
        res.status(200).json({
            message: 'success'
        });
    });
});

router.all('/taskValidationRandomFail', function (req, res) {
    // randomly fail 50% of the time
    var n = Math.floor(Math.random() * 100) < 50;
    if (Math.floor(Math.random() * 10) > 5) {
        res.status(400).json({
            message: 'fail'
        });
    } else {
        res.status(200).json({
            message: 'success'
        });
    }
});

router.all('/taskValidationAlwaysSucceed', function (req, res) {
    res.status(200).json({
        message: 'success'
    });
});

router.all('/taskValidationAlwaysFail', function (req, res) {
    res.status(400).json({
        message: 'fail'
    });
});

app.use('/api', router);
app.all('/', help);
app.all('/clear', clear);

app.disable('etag');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/data', function (req, res) {
    // res.headers['Access-Control-Allow-Origin'] = '*';
    // res.headers['Access-Control-Allow-Credentials'] = true;
    // res.headers['Access-Control-Allow-Methods'] = 'POST, GET';
    // res.headers['Access-Control-Allow-Headers'] = 'Content-Type';

    res.status(200).json([{
        "value": "rambo",
        "text": "John Rambo"
    }, {
        "value": "norris",
        "text": "Chuck Norris"
    }, {
        "value": "arnold",
        "text": "Arnold Schwarzenegger"
    }]);
});

// START THE SERVER
app.listen(port);
console.log('Running. Listen port: ' + port);