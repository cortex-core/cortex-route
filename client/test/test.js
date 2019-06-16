const chai = require('chai');
const chai_http = require('chai-http');
const _ = require('lodash');
const chai_date_string = require('chai-date-string');
const log = require('cortex-route-shared').log;
const Client = require('./../main/client');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

chai.should();
chai.use(chai_http);
chai.use(chai_date_string);

describe('cortex-route-client tests', function() {

    let client;
    let axios_mock;

    before(function(){
        return new Promise(function (resolve) {
            log.info("Initializing testing bed...");
            axios_mock = new MockAdapter(axios);

            axios_mock.onGet(Client.url + '/route') // Unfortunately, we couldn't use builtin query params filter
                .reply(function (req) {
                    let peer = _.first(req.peers);
                    if (peer == "address1") {
                        return [200, [{
                            peer_id: 'address1',
                            route: {
                                ep1: 'ctx://127.0.0.1:58987'
                            }
                        }]];
                    } else {
                        return [404];
                    }
                });

            client = new Client();
            resolve();
        });
    });

    after(function(){
        log.info("Finalizing testing bed...");
        axios_mock.restore();
    });

    it('should provide return mocked results correctly', function(done){
        client.query_routes("address1").then(function(res) {
            res.should.have.status(200);
            res.data.should.be.an('array');
            res.data.should.have.lengthOf(1);
            let route = _.first(res.data);
            route.should.have.property('peer_id');
            route.should.have.property('route');
            done();
        });
    });

    it('should provide return 404 if address is not defined in mocked db', function(done){
        client.query_routes("asdasdasdasd").catch(function (err) {
            err.response.should.have.status(404);
            done();
        });
    });

    it('should provide return 404 if address is not defined in mocked db', function(done){
        client.query_routes("asdasdasdasd").catch(function (err) {
            err.response.should.have.status(404);
            done();
        });
    });

});



