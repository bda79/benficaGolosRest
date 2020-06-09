const jwt = require('jsonwebtoken');
const config = require('./env');
const translate = require('./translate');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send(translate('mid.auth.401'));//'Access denied. No token provided'

    try {
        const decoded = jwt.verify(token, config().jwtPrivateKey);
        req.user = decoded;
        next();
    }
    catch (ex) {
        res.status(400).send(translate('mid.auth.400'));//'Invalid token.'
    }
};