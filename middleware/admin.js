const translate = require('./translate');

module.exports = function (req, res, next) {
    if (!req.user.isAdmin) return res.status(403).send(translate('mid.admin.403'));//'Access denied.'

    next();
};