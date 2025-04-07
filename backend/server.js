// Load environment variables from .env file
require("dotenv").config({ override: true });

// Server port, default 5000
const port = process.env.SERVER_PORT || 5000;

// Import required modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { Resend } = require("resend");
const { spawn } = require("child_process");

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

// Update the path in your analyze endpoint (there are two copies in your file)
app.get("/analyze/:submissionId", auth, async (req, res) => {
  try {
    const submissionId = req.params.submissionId;

    // Retrieve the submission from the database
    const submission = await submissionSchema.findById(submissionId);
    if (!submission || !submission.file) {
      return res.status(404).json({ message: "Submission or file not found" });
    }

    // Create a temporary directory for processing
    const tempDir = require("os").tmpdir();
    const tempFilePath = `${tempDir}/${submission._id}_${submission.file.name}`;

    // Write the file to disk
    require("fs").writeFileSync(tempFilePath, submission.file.data);

    // Variable to store the data sent from Python
    let dataToSend = "";

    // Fix the path to the Python script - use path.resolve for reliability
    const path = require("path");
    const scriptPath = path.resolve(
      __dirname,
      "..",
      "ai_processing",
      "processor.py"
    );

    // Spawn the Python process with the file path but don't use --analyze flag
    // This will make it analyze without saving to a file
    const python = spawn("python", [
      scriptPath,
      "--pdf",
      tempFilePath,
      "--direct-output", // Add a new flag to indicate direct output mode
    ]);

    // Collect data from script
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend += data.toString();
    });

    // Handle error output
    python.stderr.on("data", function (data) {
      console.error("Python error:", data.toString());
    });

    // In close event we are sure that stream from child process is closed
    python.on("close", (code) => {
      console.log(`Python process closed with code ${code}`);

      // Clean up the temporary file
      try {
        require("fs").unlinkSync(tempFilePath);
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }

      // If process exited with error
      if (code !== 0) {
        return res.status(500).json({
          message: "Error analyzing document",
          details: dataToSend,
        });
      }

      // Send data to browser
      res.json({
        submissionId,
        filename: submission.file.name,
        analysis: dataToSend,
      });
    });
  } catch (error) {
    console.error("Error in analyze endpoint:", error);
    res.status(500).json({
      message: "Error processing analysis request",
      error: error.message,
    });
  }
});

// Endpoint to query the AI model - Fix the route pattern to use query params correctly
app.get("/query/:query", auth, async (req, res) => {
  try {
    const query = req.params.query;
    const submissionId = req.query.submissionId; // Get submissionId from query params
    
    // Debug logs to help diagnose issues
    console.log("Query received:", query);
    console.log("Submission ID:", submissionId);

    // Variable to store the data sent from Python
    let dataToSend = "";

    // Use path.resolve for reliable path resolution
    const path = require("path");
    const scriptPath = path.resolve(
      __dirname,
      "..",
      "ai_processing",
      "query.py"
    );

    // Fetch api key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY || "no_key";
    
    // Create an array of arguments for the Python script
    let pythonArgs = [
      scriptPath,
      "--query",
      query,
      "--key",
      apiKey,
    ];

    // If a submission ID is provided, fetch the associated file
    if (submissionId) {
      try {
        const submission = await submissionSchema.findById(submissionId);
        if (submission && submission.file) {
          // Write the file to disk
          const tempDir = require("os").tmpdir();
          const tempFilePath = `${tempDir}/${submission._id}_${submission.file.name}`;
          require("fs").writeFileSync(tempFilePath, submission.file.data);
          
          // Add PDF path to arguments
          pythonArgs.push("--pdf");
          pythonArgs.push(tempFilePath);
          console.log("Added PDF file to query:", tempFilePath);
        } else {
          console.log("No file found for submission:", submissionId);
        }
      } catch (err) {
        console.error("Error retrieving submission:", err);
      }
    }

    // Spawn the Python process with all arguments
    const python = spawn("python", pythonArgs);

    // Collect data from script
    python.stdout.on("data", function (data) {
      console.log("Received data from Python script:", data.toString());
      dataToSend += data.toString();
    });

    python.stderr.on("data", function (data) {
      console.error("Python error:", data.toString());
    });

    python.on("close", (code) => {
      console.log(`Python process closed with code ${code}`);

      // If process exited with error
      if (code !== 0) {
        return res.status(500).json({
          message: "Error querying AI model",
          details: dataToSend || "No output from Python script",
        });
      }

      // Try to parse the response as JSON
      try {
        // Send data to browser
        res.json({
          query,
          response: dataToSend.trim(),
        });
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        res.status(500).json({
          message: "Error processing AI response",
          details: "Invalid response format"
        });
      }
    });
  } catch (error) {
    console.error("Error in query endpoint:", error);
    res.status(500).json({
      message: "Error processing query request",
      error: error.message,
    });
  }
});

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

// Get event by id
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

    var emailText = "";

    // Get email text associated with the event from MongoDB
    try {
      const event = await eventSchema.findById(eventId);
      emailText = event.emailText;
    } catch (error) {
      console.error("Error fetching event emailText:", error);
    }

    // Send confirmation email
    await resend.emails.send({
      from: process.env.RESEND_DOMAIN,
      to: email,
      subject: "Submission Confirmation",
      text: emailText,
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

// Add this endpoint after your other endpoints

// Endpoint to check Python environment
app.get("/api/check-python", auth, async (req, res) => {
  try {
    const path = require("path");
    const scriptPath = path.resolve(
      __dirname,
      "..",
      "ai_processing",
      "check_environment.py"
    );

    let dataToSend = "";

    const python = spawn("python", [scriptPath]);

    python.stdout.on("data", function (data) {
      dataToSend += data.toString();
    });

    python.stderr.on("data", function (data) {
      console.error("Python error:", data.toString());
      dataToSend += "ERROR: " + data.toString();
    });

    python.on("close", (code) => {
      console.log(`Python environment check process closed with code ${code}`);

      // Check if OpenRouter API key is set
      const openrouter_api_key = process.env.OPENROUTER_API_KEY;
      const api_status =
        openrouter_api_key &&
        openrouter_api_key !== "your_openrouter_api_key_here"
          ? "✅ OpenRouter API key is configured"
          : "⚠️ OpenRouter API key is not configured. Local analysis will be used.";

      dataToSend += "\n\nAPI Status:\n" + api_status;

      res.json({
        success: code === 0,
        output: dataToSend,
        exitCode: code,
        api_configured:
          openrouter_api_key &&
          openrouter_api_key !== "your_openrouter_api_key_here",
      });
    });
  } catch (error) {
    console.error("Error checking Python environment:", error);
    res.status(500).json({
      message: "Error checking Python environment",
      error: error.message,
    });
  }
});
