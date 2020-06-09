
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {User, validateUser} = require('../models/user');
const express = require('express');
const translate = require('../middleware/translate');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send(translate('rout.users.404')); //'User was not found.'
    
    res.send(user);
});

router.post('/', [validate(validateUser)], async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send(translate('rout.users.400')); //'User already registered.'

    user = new User(_.pick(req.body, ['name', 'email', 'password', 'isAdmin']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'isAdmin']));//lodash pick method, chose obj attribute and create new obj
});

module.exports = router;