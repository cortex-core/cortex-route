const chai = require('chai');
const chai_http = require('chai-http');
const _ = require('lodash');
const chai_date_string = require('chai-date-string');
const MongoClient = require("mongodb").MongoClient;
const MongoClientMock = require('mongo-mock').MongoClient;
const stun = require('node-stun');
const sinon = require('sinon');

chai.should();
chai.use(chai_http);
chai.use(chai_date_string);

describe('cortex-route simple tests', function() {

    let mongo_stub;
    let stun_stub;
    let service;
    let _db;

    before(function(){
        return new Promise(function (resolve) {
            console.log("Initializing testing bed...");

            mongo_stub = sinon.stub(MongoClient, 'connect');
            stun_stub = sinon.stub(stun, 'createServer');

            stun_stub.callsFake(function() {
                console.log('Mocking stun server...');
                return {on: sinon.fake(), listen: sinon.fake()};
            });

            MongoClientMock.connect('mongodb://mongodb:27017/', function(db_err, db) {
                chai.should().equal(db_err, null);
                _db = db.db("cortex-route-cache");
                _db.collection("peers").insert({peer_id:'address1', route:{ep1:'ctx://127.0.0.1:58987'}}, function(err) {
                    chai.should().equal(err, null);
                    mongo_stub.callsFake(function(url, cb) {
                        cb(null, db);
                    });
                    service = require('./../main/service');
                    resolve();
                });
            });
        });
    });

    after(function(){
        console.log("Finalizing testing bed...");
        mongo_stub.restore();
        stun_stub.restore();
    });

    it('should provide interface via /route GET endpoint to query routes', function(done){
        chai.request(service)
            .get('/route')
            .query({'peers[]': 'address1'})
            .send()
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



