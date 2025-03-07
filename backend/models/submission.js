const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
      eventId: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ["person", "company"],
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      file: {
        data: Buffer,
        contentType: String,
        name: String,
      },
      paid: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;

