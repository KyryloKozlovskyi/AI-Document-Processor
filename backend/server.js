// Load environment variables from .env file
require("dotenv").config();

// Server port, default 5000
const port = process.env.SERVER_PORT || 5000;

// Import required modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

// Initialize Express app
const app = express();

// Enable CORS for all incoming requests
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if the database connection fails
  });

// Configure Multer for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const submissionSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Create Submission model
const Submission = mongoose.model("Submission", submissionSchema);

// Create submission endpoint
app.post("/api/submit", upload.single("file"), async (req, res) => {
  try {
    const { type, name, email } = req.body;

    const submission = new Submission({
      type,
      name,
      email,
      file: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
            name: req.file.originalname,
          }
        : null,
    });

    await submission.save();

    res.status(201).json({
      message: "Submission successful",
      submission: {
        type: submission.type,
        name: submission.name,
        email: submission.email,
        fileName: submission.file?.name,
      },
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      message: "Error processing submission",
      error: error.message,
    });
  }
});

// Get all submissions
app.get("/api/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// Download file endpoint
app.get("/api/submissions/:id/file", async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission || !submission.file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set({
      "Content-Type": submission.file.contentType,
      "Content-Disposition": `attachment; filename="${submission.file.name}"`,
    });

    res.send(submission.file.data);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = mongoose.model("Submission", submissionSchema);
