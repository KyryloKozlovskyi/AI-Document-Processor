const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  type: String,
  name: String,
  email: String,
  file: {
    data: Buffer,
    contentType: String,
    name: String
  }
}, { timestamps: true });

module.exports = submissionSchema;
