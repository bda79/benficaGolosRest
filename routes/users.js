const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {User, validateUser, validateUserNoPW} = require('../models/user');
const express = require('express');
const translate = require('../middleware/translate');
const validateObjectId = require('../middleware/validateObjectId');
const router = express.Router();

const pwHashed = RegExp(/^\$2[ayb]\$.{56}$/);

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send(translate('rout.users.404')); //'User was not found.'
    
    res.send(user);
});

router.get('/', auth, async (req, res) => {
    const users = await User.find().sort('name').select('-password');
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
    const result = {
        token: token,
        user: user
    }
    //res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'isAdmin']));//lodash pick method, chose obj attribute and create new obj
    res.send(result);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const options = await createOptions(req.body);
    if (options && options.error) return res.status(404).send(options.error);
    
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

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('The user with given ID was not found.');

    res.send(user);
});

const createOptions = async (params) => {
    let options = {};
    let noModifyPW = false;
    Object.keys(params).map(async function(key) {
        if (key === 'name') {
            options.name = params[key];
        }
        if (key === 'email') {
            options.email = params[key];
        }
        if (key === 'password') {
            if (pwHashed.test(params[key])) {
                options.password = params[key];
                noModifyPW = true;
            } 
            else {
                options.password = params[key];
            }
        }
        if (key === 'isAdmin') {
            options.isAdmin = params[key];
        }
    });
    console.log("opt", options);
    if (!noModifyPW) {
        const { error } = validateUser(options);
        if (error) {
            options.error = error.details[0].message;
            return options;
        }

        encrypt(options.password)
        .then(data => {
            if (data) {
                options.password = data;
                return options;
            }
        }).catch(err => {
            console.log(err);
            options.password = null;
            return options;
        });
        
    }
    else 
    {
        const { error } = validateUserNoPW(options);
        if (error)
            options.error = error.details[0].message;
        return options;
    }
}

const encrypt = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const pw = await bcrypt.hash(password, salt);
    return pw;
}

module.exports = router;