const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const {Game} = require('../models/game');
const {Season, validateSeason} = require('../models/season');
const express = require('express');
const router = express.Router();


router.get('/', auth, async (req, res) => {
    const season = await Season.show();
    
    res.send(season);
});

router.post('/', [auth, validate(validateSeason)], async (req, res) => {

    let season = await Season.lookup(req.body.name);
    if (season) return res.status(400).send('Season exists!');

    season = new Season({
        name: req.body.name,
        begin: req.body.begin,
        end: req.body.end
    });

    await season.save();
    season = await Season.show(season._id);
    res.send(season);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    let season = await Season.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        begin: req.body.begin,
        end: req.body.end
    }, 
    {new: true});

    if (!season) return res.status(404).send('The season with given ID was not found.');

    season = await Season.show(season._id);
    res.send(season);
});

router.put('/:id/addGame', [auth, validateObjectId], async (req, res) => {
  
    const game = await Game.findById(req.body.gameId);
    if (!game) return res.status(404).send('The game with given ID was not found.');

    let season = await Season.findByIdAndUpdate(req.params.id,
    {
        $addToSet: { games: game._id }
    }, 
    {new: true});

    if (!season) return res.status(404).send('The season with given ID was not found.');

    await season.calculate();
    await season.save();

    season = await Season.show(season._id);

    res.send(season);
});

router.put('/:id/deleteGame', [auth, validateObjectId], async (req, res) => {
  
    const game = await Game.findById(req.body.gameId);
    if (!game) return res.status(404).send('The game with given ID was not found.');

    let season = await Season.findByIdAndUpdate(req.params.id,
    {
        $pullAll: { games: [game._id] }
    }, 
    {new: true});

    if (!season) return res.status(404).send('The season with given ID was not found.');

    await season.calculate();
    await season.save();

    season = await Season.show(season._id);

    res.send(season);
});

router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {

    const season = await Season.findByIdAndRemove(req.params.id);
    if (!season) return res.status(404).send('The season with given ID was not found.');

    res.send(season);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    let season = await Season.show(req.params.id);
    if (!season) return res.status(404).send('The season with given ID was not found.');
    
    await season.calculate();
    await season.save();

    season = await Season.show(season._id);

    res.send(season);
});


module.exports = router;