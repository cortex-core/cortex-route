const winston = require('winston');

module.exports = winston.createLogger({
    level: 'silly',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});
