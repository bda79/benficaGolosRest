const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const {User} = require('../models/user');
const {Payment} = require('../models/payment');
const {Season} = require('../models/season');
const express = require('express');
const router = express.Router();

router.get('/:id',[auth, validateObjectId], async (req, res) => {
    getSeason(req.params.id, async function(err, season) {
        if (err) return res.status(404).send(err.message);
        
        const users = await findUsers();
        const status = await calculateStatus(users, season);

        res.send(status);

    });

});

router.get('/:sid/user/:uid',[auth, validateObjectId], async (req, res) => {
    getSeason(req.params.sid, async function(err, season) {
        if (err) return res.status(404).send(err.message);
        
        const user = await findUsers(req.params.uid);
        if (!user) return res.status(404).send('The User with given ID was not found!');

        const pay = await getUserPayment(season, user._id);
        let payment = 0;
        if (pay[0] && pay[0].total)
            payment = pay[0].total;
        
        const status = returnStatus(user, payment, season);
        
        res.send(status);
    });

});

router.get('/list/:sid/user/:uid',[auth, validateObjectId], async (req, res) => {
    getSeason(req.params.sid, async function(err, season) {
        if (err) return res.status(404).send(err.message);
        
        const user = await findUsers(req.params.uid);
        if (!user) return res.status(404).send('The User with given ID was not found!');

        const result = await getListSeasonUser(season, user._id);
        if (result && result.length > 0) {
            const status = result.map((el) => {
                const {_id, total} = el;
                return {date: _id.yearMonthDay, total: total};
            });

           return res.send(status);
        }
        
        res.send([]);
    });

});

router.get('/list/:uid',[auth, validateObjectId], async (req, res) => {
    const user = await findUsers(req.params.uid);
    if (!user) return res.status(404).send('The User with given ID was not found!');

    const result = await getListUser(user._id);
    if (result && result.length > 0) {
        const status = result.map((el) => {
            const {_id, total} = el;
            return {date: _id.yearMonthDay, total: total};
        });

        return res.send(status);
    }
    
    res.send([]);
});

async function calculateStatus(users, season) {
    let result = [];
   
    for(const user of users) {
        
        const pay = await getUserPayment(season, user._id);

        let payment = 0;
        if (pay[0] && pay[0].total)
            payment = pay[0].total;

        result.push( returnStatus(user, payment, season));
    }

    return result;
}

function returnStatus(user, pay, season) {
    let value = 0;
    if (pay < season.goals) {
        value = Math.abs(season.goals - pay);
    }

    const status = {
        user : user.name,
        pay : pay,
        goals: season.goals,
        nPay : value
    }

    return status;
}

function getUserPayment(season, userId) {
    return Payment.total(season.begin, season.end, userId);
}

function getListSeasonUser(season, userId) {
    return Payment.list_Season_User(season.begin, season.end, userId);
}

function getListUser(userId) {
    return Payment.list_User(userId);
}

async function getSeason(id, cb) {
    let season = await Season.findById(id);
    if (!season) return cb(new Error('The Season with given ID was not found!'));

    await season.calculate();
    season = await season.save();

    return cb(null, season);
}

function findUsers(user) {
    if (!user) return User.find({}).sort('name');

    return User.findById(user);
}

module.exports = router;