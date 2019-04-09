const chai = require('chai');
const chai_http = require('chai-http');
const _ = require('lodash');
const chai_date_string = require('chai-date-string');
const MongoClient = require("mongodb").MongoClient;
const MongoClientMock = require('mongo-mock').MongoClient;

const log = require('./../src/log');

const sinon = require('sinon');

chai.should();
chai.use(chai_http);
chai.use(chai_date_string);

describe('cortex-axon simple tests', function() {

    let mongo_stub;
    let service;
    let _db;

    before(function(){
        return new Promise(function (resolve) {
            log.info("Initializing testing bed...");

            mongo_stub = sinon.stub(MongoClient, 'connect');

            MongoClientMock.connect('mongodb://localhost:27017/', function(db_err, db) {
                chai.should().equal(db_err, null);
                _db = db.db("cortex-route-cache");
                _db.collection("peers").insert({peer_id:'address1', route:{}}, function(err, res) {
                    chai.should().equal(err, null);
                    mongo_stub.callsFake(function foo(url, cb) {
                        cb(null, db);
                    });
                    service = require('./../service');
                    resolve();
                });
            });
        });
    });

    after(function(){
        log.info("Finalizing testing bed...");
        mongo_stub.restore();
    });

    it('should provide interface via /route GET endpoint to query routes', function(done){
        let params = {};
        params.peers = ['address1'];
        chai.request(service)
            .get('/route')
            .send(params)
            .end(function(err, res){
                chai.should().equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(1);
                let route = _.first(res.body);
                route.should.have.property('peer_id');
                route.should.have.property('route');
                done();
            });
    });

});



