//const translate = require('./middleware/translate');
//const localeService = require('./service/localeService');
const config = require('./middleware/env');
const express = require('express');
const app = express();

/*
console.log(localeService.getLocales());
console.log(translate('hello'));
console.log(translate('hello', 'en'));
*/

require('./startup/db')();
require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/config')();
require('./startup/validation')();

const port = config().port;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));



module.exports = server;