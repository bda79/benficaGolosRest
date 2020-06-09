const config = require('../middleware/env');

module.exports = function() {
    if (!config().jwtPrivateKey) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined');
    }
};