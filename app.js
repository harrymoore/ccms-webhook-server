var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    // BSON = require('mongodb').pure().BSON,
    assert = require('assert');

// Set up the connection to the local db
var mongoclient = new MongoClient(new Server("localhost", 20000), {native_parser: true});

MongoClient.connect(new Server("localhost", 20000), function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    db.close();
});
