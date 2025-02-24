const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    courseName: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
}, { timestamps: true });

module.exports = eventSchema;