const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventId: {
        type: String,
        required: true,
      },
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