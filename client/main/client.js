const log = require('cortex-route-shared').log;
const axios = require("axios");

class RouteClient {

    query_routes(req) {
        log.debug("Request");
        return axios.post(RouteClient.url + '/query_routes', req);
    }
}

RouteClient.url = 'route-machine:8080';

module.exports = RouteClient;