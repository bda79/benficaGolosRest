const logger = require('./logger');
const translate = require('./translate');

module.exports = function(err, req, res, next){
    logger.error(err.message, {metadata:err});
    if (req.file) {
        res.status(404).send(translate('mid.error.404'))
    }
    res.status(500).send(translate('mid.error.500'));//'Something failed.'
    next();
}