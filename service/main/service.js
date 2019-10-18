const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const _ = require('lodash');
const { MongoClient } = require('mongodb');

const url = 'mongodb://mongodb:27017/';

let app = express();
let _db = undefined;

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(validator());

MongoClient.connect(url, function(err, db) {

    if (err) {
        console.log("Mongo DB connection has been failed.");
        throw err;
    }

    console.log("Mongo DB connection has been provided.");
    _db = db.db("cortex-route-cache");

    //https://stackoverflow.com/questions/978061/http-get-with-request-body
    app.get('/route', function(req, res) {
        console.log("Route method is being called");
        req.checkQuery('peers', 'Peers parameter should be an array!!').isArray();
        req.checkQuery('peers', 'Peers parameter is required!').notEmpty();
        let errors = req.validationErrors();
        if (errors) {
            res.status(403).send(_.map(errors, err => { return err.msg; }));
            return;
        }
        let peers = req.query.peers;
        console.log("Params are validated");
        // Temporary Route Results
        _db.collection("peers").find({"peer_id":{'$in' : peers}}).toArray(function (err, result) {
            if(err != null) {
                console.log("DB returned error.");
                res.status(503).send(err);
                return;
            }

            if(_.isEmpty(result)) {
                res.status(404).send("There is no such account!");
                return;
            }

            res.json(_.map(result, function(item) { return _.omit(item, '_id')}));
        });
    });

    app.listen(8080, function() {
        console.log("cortex-route started.");
    });
});

module.exports = app;