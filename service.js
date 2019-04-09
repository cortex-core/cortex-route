const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const _ = require('lodash');
const { MongoClient, ObjectId } = require('mongodb');
const log = require('./src/log');

const TTL = 180;

const url = 'mongodb://localhost:27017/';

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
        log.error("Mongo DB connection has been failed.");
        throw err;
    }

    log.info("Mongo DB connection has been provided.");
    _db = db.db("cortex-route-cache");

    app.get('/route', function(req, res) {
        log.debug("Route method is being called");
        req.checkBody('peers', 'Peers parameter should be an array!!').isArray();
        req.checkBody('peers', 'Peers parameter is required!').notEmpty();
        let errors = req.validationErrors();
        if (errors) {
            res.status(403).send(_.map(errors, err => { return err.msg; }));
            return;
        }
        let peers = req.body.peers;
        log.debug("Params are validated");
        // Temporary Route Results
        _db.collection("peers").find({"peer_id":{'$in' : peers}}).toArray(function (err, result) {
            if(err != null) {
                log.error("DB returned error.");
                res.status(503).send(err);
                return;
            }

            if(_.isEmpty(result)) {
                res.status(404).send("There is no such account!");
                return;
            }

            res.json(result);
        });
    });

    app.listen(9999, function() {
        log.info("cortex-axon started.");
    });
});

module.exports = app;