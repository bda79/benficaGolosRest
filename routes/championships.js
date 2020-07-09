const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const {Championship, validateChampionship} = require('../models/championship');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    const championships = await Championship.find().sort('name');
    res.send(championships);
});

router.post('/', [auth, validate(validateChampionship)], async (req, res) => {

    let championship = await Championship.lookup(req.body.name);
    if (championship) return res.status(400).send('Championship exists!');

    championship = new Championship({name: req.body.name});
    await championship.save();
    res.send(championship);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const championship = await Championship.findByIdAndUpdate(req.params.id, {name: req.body.name}, {new: true});

    if (!championship) return res.status(404).send('The championship with given ID was not found.');

    res.send(championship);
});

router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {

    const championship = await Championship.findByIdAndRemove(req.params.id);
    if (!championship) return res.status(404).send('The championship with given ID was not found.');

    res.send(championship);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const championship = await Championship.findById(req.params.id);
    if (!championship) return res.status(404).send('The championship with given ID was not found.');

    res.send(championship);
});


module.exports = router;