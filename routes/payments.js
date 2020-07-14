const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const {User} = require('../models/user');
const {Payment, validatePayment} = require('../models/payment');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    const payment = await Payment.show();
    res.send(payment);
});

router.post('/', [auth, validate(validatePayment)], async (req, res) => {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send('Invalid User');

    let payment = await Payment.lookup(req.body.date, user._id);
    if (payment) return res.status(400).send('Payment exists!');

    payment = new Payment({
        date: req.body.date,
        user: user._id,
        amount: req.body.amount
    });

    await payment.save();
    payment = await payment.show();
    res.send(payment);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send('Invalid User');

    let payment = await Payment.findByIdAndUpdate(req.params.id, {
        date: req.body.date,
        user: user._id,
        amount: req.body.amount
    }, 
    {new: true});

    if (!payment) return res.status(404).send('The payment with given ID was not found.');

    payment = await Payment.show();
    res.send(payment);
});


router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {

    const payment = await Payment.findByIdAndRemove(req.params.id);
    if (!payment) return res.status(404).send('The payment with given ID was not found.');

    res.send(payment);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    let payment = await Payment.show(req.params.id);
    if (!payment) return res.status(404).send('The payment with given ID was not found.');

    res.send(payment);
});


module.exports = router;