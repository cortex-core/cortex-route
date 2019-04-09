const log = require('cortex-axon-shared').log;
const axios = require("axios");

class RouteClient {

    query_routes(req) {
        return axios.post(RouteClient.url + '/query_routes', req);
    }
}

RouteClient.url = 'localhost:9999';

module.exports = RouteClient;