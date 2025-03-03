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
const { Resend } = require('resend');

const submissionSchema = require('./models/submission');
const eventSchema = require('./models/event');

// Create Mongoose models
const Submission = mongoose.model("Submission", submissionSchema);
const Event = mongoose.model("Event", eventSchema);

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Create submission endpoint
app.post("/api/submit", upload.single("file"), async (req, res) => {
  try {
    const { eventId, type, name, email } = req.body;

    if (req.file && req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // check if email is valid
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const submission = new Submission({
      eventId,
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

    // Send confirmation email
    await resend.emails.send({
      from: process.env.RESEND_DOMAIN,
      to: email,
      subject: 'Submission Confirmation',
      text: `Dear ${name},\n\nThank you for your submission. We have received your ${type} submission successfully.\n\nBest regards,\nYour Company`
    });

    res.status(201).json({
      message: "Submission successful",
      submission: {
        eventId: submission.eventId,
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

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Update event
app.put("/api/events/:id", async (req, res) => {
  try {
    await eventSchema.findByIdAndUpdate(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
});

// Delete event
app.delete("/api/events/:id", async (req, res) => {
  try {
    await eventSchema.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
