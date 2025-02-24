
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
    {
      eventId: {
        type: String,
        required: true,
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
    },
    {
      timestamps: true,
    }
  );

const File = mongoose.model('Submission', fileSchema);

module.exports = File;
