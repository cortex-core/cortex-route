const chai = require('chai');
const chai_http = require('chai-http');
const _ = require('lodash');
const chai_date_string = require('chai-date-string');
const Redis = require('redis');
const sinon = require('sinon');

chai.should();
chai.use(chai_http);
chai.use(chai_date_string);

describe('cortex-route Redis Failure Handling IT', function() {

    let service;
    let redis_client_create_mock;

    before(function(){
        redis_client_create_mock = sinon.stub(Redis, 'createClient');
        redis_client_create_mock.returns({mget:function (keys, cb) {
                cb(new Error('Redis Failed'));
            }});
        return new Promise(function (resolve) {
            console.log("Initializing testing bed...");
            service = require('./../main/service');
            resolve();
        });
    });

    after(function(){
        console.log("Finalizing testing bed...");
        redis_client_create_mock.restore();
    });

    it('should fail with 503 if redis fails', function(done){
        chai.request(service)
            .get('/route')
            .query({'peers[]': 'somekey'})
            .send()
            .end(function(err, res){
                chai.should().equal(err, null);
                res.status.should.be.equal(503);
                done();
            });
    });

});