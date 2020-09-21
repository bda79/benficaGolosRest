const express = require('express'); 
const users = require('../routes/users');
const auth = require('../routes/auth');
const teams = require('../routes/teams');
const championships = require('../routes/championships');
const games = require('../routes/games');
const seasons = require('../routes/seasons');
const payments = require('../routes/payments');
const status = require('../routes/status');
const error = require('../middleware/error');
const forgot = require('../routes/forgot');

module.exports = function(app) {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });
    app.use(express.json());
    app.use(express.static('public'));
    app.use('/uploads', express.static('uploads'));
    app.use('/api/auth', auth);
    app.use('/api/users', users);
    app.use('/api/teams', teams);
    app.use('/api/championships', championships);
    app.use('/api/games', games);
    app.use('/api/seasons', seasons);
    app.use('/api/payments', payments);
    app.use('/api/status', status);
    app.use('/api/forgot', forgot);
    app.use('/api/wake-up', (_, res) => res.json({ status: 'Awake' }));

    app.use(error);
}