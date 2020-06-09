const dotenv = require('dotenv');
dotenv.config();

let config_data = null;

module.exports = function () {
    // if loaded return

    if (config_data != null && config_data != undefined) return config_data;

    config_data = {};
    const NODE_ENV = process.env.NODE_ENV;

    //Load from json config
    if (NODE_ENV === undefined || NODE_ENV == null || NODE_ENV === 'development') {
        config_data = require('../config/config.development.json');
    }
    else if (NODE_ENV === undefined || NODE_ENV == null || NODE_ENV === 'test') {
        config_data = require('../config/config.test.json');
    }
    else {
        config_data = require('../config/config.production.json');
    }

    //LOAD from ENV
    config_data.db = getEnvValue(config_data.db);
    config_data.jwtPrivateKey = getEnvValue(config_data.jwtPrivateKey);
    config_data.port = getEnvValue(config_data.port);
    config_data.env = NODE_ENV;

    return config_data;

}

function getEnvValue(name) {
    let value = process.env[name];
    return value ? value : name;
}