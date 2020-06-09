const logger = require('../middleware/logger');
require('express-async-errors');

module.exports = function() {
    process
    .on('unhandledRejection', (ex) => {
        throw ex;
    })
    .on('uncaughtException', (ex) => {
        logger.error(ex, 'Something went wrong!!!');
        process.exit(1);
    });
}