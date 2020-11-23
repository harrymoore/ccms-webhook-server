// server.js
const express = require('express'); // call express
const app = express(); // define our app using express

const port = process.env.PORT || 8080; // set our port

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const endpoints = [
    "GET /api  List endpoints and recent requests",
    "POST /api/touch  save the POSTed form data",
    "GET /api/touch  save the request data",
    "GET /api/taskValidationAlwaysSucceed  Always returns HTTP 200 and { 'message': 'success' }",
    "GET /api/taskValidationAlwaysFail  Always returns HTTP 400 and { 'message': 'fail' }",
    "GET /api/taskValidationRandomFail  Randomly succeeds roughly 50% of the time it is called. Fails the other 50%"
];

const MAX_REQUESTS = 25;
const requests = [];
function saveRequest(record) {
    if (requests.length >= MAX_REQUESTS) {
        requests.shift()
    }

    requests.push(record);
}

var help = function (req, res) {
    console.log('req ' + req.ref);
    res.status(200).json({
        message: 'success',
        endpoints: endpoints,
        recentRequests: requests || []
    });
}

var clear = function (req, res) {
    console.log('req ' + req.ref);

    requests.splice(0, requests.length);

    res.status(200).json({
        message: 'success'
    });
}

var router = express.Router(); // get an instance of the express Router
router.get('/', help);

router.all('/touch', function (req, res) {

    var record = {
        "timestamp": new Date(),
        "method": req.method,
        "url": req.originalUrl,
        "ip": req.ip,
        "hostname": req.hostname || "",
        "body": req.body || {},
        "params": req.params || {},
        "headers": req.headers || {}
    };

    saveRequest(record);

    console.log('saved to requests list');

    res.status(200).json({
        message: 'success'
    });
});

router.all('/taskValidation', function (req, res) {

    var record = {
        "method": req.method,
        "url": req.originalUrl,
        "ip": req.ip,
        "hostname": req.hostname || "",
        "body": req.body || {}
    };

    saveRequest(record);

    console.log('saved to database');
    res.status(200).json({
        message: 'success'
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