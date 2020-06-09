const _ = require('lodash');
const Joi = require('joi');
const { compare } = require('bcrypt');
const validation = require('../middleware/validate');
const { User } = require('../models/user');
const { Router } = require('express');
const translate = require('../middleware/translate');
const router = Router();

router.post('/', validation(validateAuth), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(translate('rout.auth.400')); //'Invalid email or password.'

    const valid = await compare(req.body.password, user.password);
    if (!valid) return res.status(400).send(translate('rout.auth.400'));

    const token = user.generateAuthToken();
    res.send(token);

});

function validateAuth(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;