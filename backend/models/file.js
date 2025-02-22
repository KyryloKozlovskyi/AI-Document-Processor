const { text } = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Mongoose model suited for storing file information
const fileSchema = new Schema({
    filename: String,
    path: String,
    size: Number,
    contentType: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the model
const File = mongoose.model('file', fileSchema);
module.exports = File;