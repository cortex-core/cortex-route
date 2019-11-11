const chai = require('chai');
const chai_http = require('chai-http');
const _ = require('lodash');
const chai_date_string = require('chai-date-string');
const Redis = require('redis');

chai.should();
chai.use(chai_http);
chai.use(chai_date_string);

describe('cortex-route IT', function() {

    let service;
    let redis;

    before(function(){
        redis = Redis.createClient(); // Connect to local redis
        redis.on("error", function (err) {
            console.log(err);
        });
        return new Promise(function (resolve) {
            console.log("Initializing testing bed...");
            // Populate redis with necessary data
            redis.set('address1', '127.0.0.1:12345');
            redis.set('address2', '127.0.0.1:12344');
            service = require('./../main/service');
            resolve();
        });
    });

    after(function(){
        console.log("Finalizing testing bed...");
        redis.quit();
    });

    it('should provide an interface via /route GET endpoint to query routes', function(done){
        chai.request(service)
            .get('/route')
            .query({'peers': ['address1', 'address2']})
            .send()
            .end(function(err, res){
                chai.should().equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(2);
                let route = _.first(res.body);
                route.should.be.equal('127.0.0.1:12345');
                done();
            });
    });

    it('should return null if keys not found', function(done){
        chai.request(service)
            .get('/route')
            .query({'peers[]': 'non-existent-key'})
            .send()
            .end(function(err, res){
                chai.should().equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(1);
                let route = _.first(res.body);
                chai.should().equal(route, null);
                done();
            });
    });

});