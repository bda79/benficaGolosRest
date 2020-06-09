const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const Joi = require('joi');

const pop = {
    path: 'user',
    model: 'User',
    select: 'name'
};

const paymentSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    }
});

paymentSchema.statics.show = function(arg) {
    return show(this, arg);
}

paymentSchema.statics.lookup = function(date, userId) {
    return this.findOne({ date: date, user: userId});
}

paymentSchema.statics.total = function(begin, end, userId) {
    return Payment.aggregate([
        { "$match": { "date": { "$gte": begin, "$lte": end }, "user": ObjectId(userId) } },
        { "$group": {"_id": null, "total": { "$sum": "$amount"} } }
    ]);
}

const Payment = mongoose.model('Payment', paymentSchema);

function show(payment, arg) {
    if (!arg) {
        return payment.find().sort('date').populate(pop);
    }

    const id = arg._id ? arg._id : arg;
    return payment.findById(id).populate(pop);
}

function validatePayment(payment) {
    const schema = {
        date: Joi.date().required(),
        userId: Joi.objectId().required(),
        amount: Joi.number().min(0)
    };

    return Joi.validate(payment, schema);
}

exports.Payment = Payment;
exports.validatePayment = validatePayment;

