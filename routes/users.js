const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {User, validateUser} = require('../models/user');
const express = require('express');
const translate = require('../middleware/translate');
const validateObjectId = require('../middleware/validateObjectId');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send(translate('rout.users.404')); //'User was not found.'
    
    res.send(user);
});

router.get('/', auth, async (req, res) => {
    const users = await User.find().sort('name');
    res.send(users);
});

router.post('/', validate(validateUser), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send(translate('rout.users.400')); //'User already registered.'

    user = new User(_.pick(req.body, ['name', 'email', 'password', 'isAdmin']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    //res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'isAdmin']));//lodash pick method, chose obj attribute and create new obj
    res.send(token);
});

router.put('/:id', [auth, validateObjectId, validate(validateUser)], async (req, res) => {
    const options = await createOptions(req.body);

    const user = await User.findByIdAndUpdate(req.params.id, 
        options, 
        {new: true});
    
    if (!user) return res.status(404).send('User with given id not found!');

    res.send(user);
});

router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {

    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send('The user with given ID was not found.');

    res.send(user);
});

const createOptions = async (params) => {
    let options = {};
    Object.keys(params).map(async function(key) {
        console.log(key);
        if (key === 'name') {
            options.name = params[key];
        }
        if (key === 'email') {
            options.email = params[key];
        }
        if (key === 'password') {
            const salt = await bcrypt.genSalt(10);
            options.password = await bcrypt.hash(params[key], salt);
        }
        if (key === 'isAdmin') {
            options.isAdmin = params[key];
        }
    });

    return options;
}

module.exports = router;