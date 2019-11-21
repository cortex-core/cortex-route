process.env['NODE_CONFIG_DIR'] = './config/';

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const _ = require('lodash');
const redis = require('redis').createClient();
const config = require('config');

let app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(validator());

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

    redis.mget(peers, function (err, result) {
        if(err != null) {
            console.log("Redis returned error.");
            res.status(503).send(err);
            return;
        }

        res.json(result);
    });
});

module.exports = app.listen(config.get('service_port'), function() {
    console.log("cortex-route started.");
});