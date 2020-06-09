const mongoose = require('mongoose');
const Joi = require('joi');

const championshipSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 5,
        maxlength: 50
    }
});

championshipSchema.statics.lookup = function(name) {
    return this.findOne({
        name: name
    });
}

const Championship = mongoose.model('Championship', championshipSchema);

function validateChampionship(championship) {
    const schema = {
        name: Joi.string().min(5).max(50).required()
    };

    return Joi.validate(championship, schema);
}

exports.Championship = Championship;
exports.validateChampionship = validateChampionship;