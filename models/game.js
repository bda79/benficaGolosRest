const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const pop = [
    {path: 'championship', model : 'Championship', select: 'name'},
    {path: 'homeTeam', model : 'Team'},
    {path: 'awayTeam', model : 'Team'}
];

const gameSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 5,
        maxlength: 50
    },
    date: {
        type: Date,
        required: true
    },
    championship: {
        type: Schema.Types.ObjectId,
        ref: "Championship",
        required: true
    },
    homeTeam: {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    awayTeam: {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    homeGoals: {
        type: Number,
        required: true,
        min: 0

    },
    awayGoals: {
        type: Number,
        required: true,
        min: 0
    }
});

gameSchema.statics.show = function(arg) {
    return show(this, arg);
}

gameSchema.statics.lookup = function(name) {
    return this.findOne({ name: name });
}

gameSchema.statics.returnGoals = async function(id) {
    const game = await Game.findById(id)
        .populate('homeTeam', ['sigla'])
        .populate('awayTeam', ['sigla']);
    
    if (!game) return 0;

    if (game && game.homeTeam.sigla === 'slb') {
        return game.homeGoals;
    } 
    else {
        return game.awayGoals;
    }
}

function show (game, arg) {
    if (!arg) {
        return game.find().sort('name').populate(pop);
    }

    const id = arg._id ? arg._id : arg;
    return game.findById(id).populate(pop);
}

const Game = mongoose.model('Game', gameSchema);

function validateGame(game) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        date: Joi.date().required(),
        championshipId: Joi.objectId().required(),
        homeTeamId: Joi.objectId().required(),
        awayTeamId: Joi.objectId().required(),
        homeGoals: Joi.number().min(0).required(),
        awayGoals: Joi.number().min(0).required()
    };

    return Joi.validate(game, schema);
}

exports.Game = Game;
exports.validateGame = validateGame;