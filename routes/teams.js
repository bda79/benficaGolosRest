const path = require('path');
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const {Team, validateTeam} = require('../models/team');
const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const fileFilter = function(req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;

    const extName = fileTypes.test(
        path.extname(file.originalname).toLocaleLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } 
    else 
    {
        cb(new Error('Not a Image!'), false);
    }
}

const upload = multer({
    storage: storage, 
    limits: {
        fieldSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/', auth, async (req, res) => {
    const teams = await Team.find().sort('name');
    res.send(teams);
});

router.post('/', [auth, upload.single('logo'), validate(validateTeam)], async (req, res) => {

    if (!req.file) return res.status(404).send('Image not selected!');

    let team = await Team.lookup(req.body.sigla);
    if (team) return res.status(400).send('Team exists!');

    team = new Team({
        name: req.body.name,
        sigla: req.body.sigla,
        logo: `uploads/${req.file.originalname}`
    });

    await team.save();
    res.send(team);
});

router.put('/:id', [auth, upload.single('logo'), validateObjectId, validate(validateTeam)], async (req, res) => {

    if (!req.file) return res.status(404).send('Image not selected!');
    
    const team = await Team.findByIdAndUpdate(req.params.id, 
    {
        name: req.body.name,
        sigla: req.body.sigla,
        logo: `uploads/${req.file.originalname}`
    }, 
    {new: true});

    if (!team) return res.status(404).send('The team with given ID was not found.');

    res.send(team);
});

router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {

    const team = await Team.findByIdAndRemove(req.params.id);
    if (!team) return res.status(404).send('The team with given ID was not found.');

    res.send(team);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).send('The team with given ID was not found.');

    res.send(team);
});


module.exports = router;