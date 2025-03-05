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
const { Resend } = require("resend");

const eventSchema = require("./models/Event");
const submissionSchema = require("./models/Submission");

const resend = new Resend(process.env.RESEND_API_KEY);

// Authentication
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("./middlewares/auth");
const User = require("./models/User");

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

// get a locally stored pdf file
app.get("/companyform", (req, res) => {
  console.log(__dirname);
  res.sendFile(__dirname + "/pdfs/companyform.pdf");
});

// Create event
app.post("/api/events", auth, async (req, res) => {
  try {
    console.log(req.body);
    const event = new eventSchema(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event" });
  }
});

// protected patch endpoint for submissions to update paid status
app.patch("/api/submissions/:id", auth, async (req, res) => {
  try {
    const submission = await submissionSchema.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.paid = req.body.paid;
    await submission.save();

    res.json(submission);
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ message: "Error updating submission" });
  }
});

/* // Create submission endpoint
app.post("/api/events", auth, async (req, res) => {
  try {
    const { eventName, venue, date, price, emailText } = req.body;

    const event = new eventSchema({
      eventName,
      venue,
      date,
      price,
      emailText,
    });

    await event.save();

    res.status(201).json({
      message: "Event creation successful",
      event: {
        eventName: event.eventName,
        venue: event.venue,
        date: event.date,
        price: event.price,
        emailText: event.emailText,
      },
    });
  } catch (error) {
    console.error("Event error:", error);
    res.status(500).json({
      message: "Error processing event",
      error: error.message,
    });
  }
}); */

/* // delete all submissions
app.delete("/api/submissions", async (req, res) => {
  try {
    await submissionSchema.deleteMany();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting submissions:", error);
    res.status(500).json({ message: "Error deleting submissions" });
  }
}); */

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

    // Delete all submissions associated with the event
    try {
      await submissionSchema.deleteMany({ eventId: req.params.id });
    } catch (error) {
      console.error("Error deleting submissions:", error);
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
});

// get event by id
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await eventSchema.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event" });
  }
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await eventSchema.find().sort({ date: -1 });
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

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await eventSchema.find().sort({ date: -1 });
    console.log(events);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Create submission endpoint
app.post("/api/submit", upload.single("file"), async (req, res) => {
  try {
    const { eventId, type, name, email } = req.body;

    if (req.file && req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // check if email is valid
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    const submission = new submissionSchema({
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
      subject: "Submission Confirmation",
      text: `Dear ${name},\n\nThank you for your submission. We have received your ${type} submission successfully.\n\nBest regards,\nYour Company`,
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
app.get("/api/submissions", auth, async (req, res) => {
  try {
    const submissions = await submissionSchema.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// Download file endpoint
app.get("/api/submissions/:id/file", async (req, res) => {
  try {
    const submission = await submissionSchema.findById(req.params.id);
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

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/auth/verify", auth, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});
