const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const {Game, validateGame} = require('../models/game');
const {Championship} = require('../models/championship');
const {Team} = require('../models/team');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    const games = await Game.show();
    res.send(games);
});

router.post('/', [auth, validate(validateGame)], async (req, res) => {
    const championship = await Championship.findById(req.body.championshipId);
    if (!championship) return res.status(400).send('Invalid championship.');

    const homeTeam = await Team.findById(req.body.homeTeamId);
    if (!homeTeam) return res.status(400).send('Invalid homeTeam.');

    const awayTeam = await Team.findById(req.body.awayTeamId);
    if (!awayTeam) return res.status(400).send('Invalid awayTeam.');

    let game = await Game.lookup(req.body.name);
    if (game) return res.status(400).send('Game exists!');

    game = new Game({
        name: req.body.name,
        date: req.body.date,
        championship: {
            _id: championship._id,
            name: championship.name
        },
        homeTeam: {
            _id: homeTeam._id,
            name: homeTeam.name
        },
        awayTeam: {
            _id: awayTeam._id,
            name: awayTeam.name
        },
        homeGoals: req.body.homeGoals,
        awayGoals: req.body.awayGoals
    });

    await game.save();
    game = await Game.show(game._id);

    res.send(game);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const championship = await Championship.findById(req.body.championshipId);
    if (!championship) return res.status(400).send('Invalid championship.');

    const homeTeam = await Team.findById(req.body.homeTeamId);
    if (!homeTeam) return res.status(400).send('Invalid homeTeam.');

    const awayTeam = await Team.findById(req.body.awayTeamId);
    if (!awayTeam) return res.status(400).send('Invalid awayTeam.');

    let game = await Game.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        championship: {
            _id: championship._id,
            name: championship.name
        },
        homeTeam: {
            _id: homeTeam._id,
            name: homeTeam.name
        },
        awayTeam: {
            _id: awayTeam._id,
            name: awayTeam.name
        },
        homeGoals: req.body.homeGoals,
        awayGoals: req.body.awayGoals
    
    }, 
    {new: true});

    if (!game) return res.status(404).send('The game with given ID was not found.');

    game = await Game.show(game._id);

    res.send(game);
});

router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {

    const game = await Game.findByIdAndRemove(req.params.id);
    if (!game) return res.status(404).send('The game with given ID was not found.');

    res.send(game);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const game = await Game.show(req.params.id);
    if (!game) return res.status(404).send('The game with given ID was not found.');

    res.send(game);
});


module.exports = router;