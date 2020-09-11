const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const {Game} = require('./game');

const pop = {
    path: 'games',
    model: 'Game',
    populate: [
        {
            path: 'championship',
            model: 'Championship',
            select: 'name',
        },
        {
            path: 'homeTeam',
            model: 'Team',
        },
        {
            path: 'awayTeam',
            model: 'Team',
        }
    ]
};

const seasonSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    begin: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    goals: {
        type: Number,
        default: 0
    },
    games: [{
        type: Schema.Types.ObjectId,
        ref: 'Game'
      }]
});

seasonSchema.statics.show = function(arg) {
    return show(this, arg);
}

seasonSchema.statics.lookup = function(name) {
    return this.findOne({ name: name });
}

seasonSchema.statics.current = function() {
    return this.find().sort({begin: -1}).limit(1).select("_id");
}

seasonSchema.methods.calculate = async function() {
    const games = this.games;
    
    let _goals = 0;
    for (const game of games) {
        const value = await Game.returnGoals(game);
        _goals += value;
    }

    this.goals = _goals;
}

const Season = mongoose.model('Season', seasonSchema);

function show(season, arg) {
    if (!arg) {
        return season.find().sort('name').populate(pop);
    }

    const id = arg._id ? arg._id : arg;

    return season.findById(id).populate(pop);
}

function validateSeason(season) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        begin: Joi.date().required(),
        end: Joi.date().required(),
        goals: Joi.number().min(0)
    };

    return Joi.validate(season, schema);
}

exports.Season = Season;
exports.validateSeason = validateSeason;