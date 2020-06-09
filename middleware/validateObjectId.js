const { Types } = require('mongoose');
const translate = require('./translate');

module.exports = function(req, res, next) {
   
    Object.keys(req.params).map( function(key) {
        console.log("-->", key, req.params[key]);

        if (!Types.ObjectId.isValid(req.params[key])) {
            return res.status(404).send(translate('mid.vobjid.400'));
        }
    });

    next();
};