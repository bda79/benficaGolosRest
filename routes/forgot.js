const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const config = require('../middleware/env');
const { sendEmail } = require('../middleware/sendemail');


const generateToken = value => {
    var d = new Date();
    var calculatedExpiresIn = (((d.getTime()) + (60 * 60 * 1000)) - (d.getTime() - d.getMilliseconds()) / 1000);
    const token = jwt.sign({ email: value, date: Date.now() }, config().jwtPrivateKey, { expiresIn: calculatedExpiresIn });
    return token;
}

router.put('/get', async (req, res) => {
    if (!req.body.email) return res.status(400).send('Email is required!');

    const APP_URL = config().app_url;
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(404).send('Email not registered!');

    const token = generateToken(user.email);
    const emailData = {
        to: user.email,
        subject: "GolosBenfica Password reset",
        text: `Please use the following link to reset your password: ${APP_URL}/reset/${token}`,
        html: `<p>Please use the following link to reset your password.</p><p>${APP_URL}/forgot/reset/${token}</p>`
    };

    sendEmail(emailData)
        .then(info => 
        {
            console.log(`Message send: ${info.response}`);
            res.status(200).send(`Email has send to ${user.email}`);
        })
        .catch(err => {
            error = err;
            console.log(`Error send email: ${err}`);
            res.status(400).send(`Error send email: ${err}`);
        });
});

router.post('/reset', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send('User with given email not found!');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.send(token);
});


module.exports = router;