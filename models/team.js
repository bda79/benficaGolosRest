const mongoose = require('mongoose');
const Joi = require('joi');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 5,
        maxlength: 50
    },
    sigla: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 5
    },
    logo: {type: String, required: true}
});

teamSchema.statics.lookup = function(sigla) {
    return this.findOne({ sigla: sigla });
}

const Team = mongoose.model('Team', teamSchema);

function validateTeam(team) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        sigla: Joi.string().min(3).max(5).required()
    };

    return Joi.validate(team, schema);
}

exports.Team = Team;
exports.validateTeam = validateTeam;