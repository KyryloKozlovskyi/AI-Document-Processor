// Load environment variables from .env file
require("dotenv").config({ override: true });

// Server port, default 5000
const PORT = process.env.SERVER_PORT || 5000;

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
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production
    : 'http://localhost:3000', // Only allow this origin in development
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions));

// Update the other headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ai-document-processor")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if the database connection fails
  });

// Configure Multer for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/* Endpoints below */

/**
 * Endpoint to analyze a PDF submission
 * @param {string} submissionId - ID of the submission to analyze
 * @returns {object} - JSON response containing analysis results
 * @throws {Error} - If an error occurs during analysis or file handling
 */
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

    // Spawn a Python process to analyze the PDF file
    const python = spawn("python", [
      scriptPath,
      "--pdf",
      tempFilePath,
      "--direct-output", // Add a new flag to indicate direct output mode
    ]);

    // Collect data from the Python script's standard output
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend += data.toString();
    });

    // Handle error output from the Python script
    python.stderr.on("data", function (data) {
      console.error("Python error:", data.toString());
    });

    // Handle the completion of the Python process
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

/** 
 * Endpoint to query the AI model with a specified query
 * @param {string} query - The query string to send to the AI model
 * @param {string} submissionId - Optional ID of the submission to analyze
 * @returns {object} - JSON response containing the AI model's response
 * @throws {Error} - If an error occurs during the query process
 * @description - This endpoint allows users to query the AI model with a specific query string.
*/
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

/**
 * Endpoint to serve the company form PDF file
 * @returns {file} - The company form PDF file
 * @throws {Error} - If an error occurs while serving the file
 * @description - This endpoint serves the company form PDF file to the client.
 */
app.get("/companyform", (req, res) => {
  console.log(__dirname);
  res.sendFile(__dirname + "/pdfs/companyform.pdf");
});

/**
 * Endpoint to serve the student form PDF file
 * @returns {file} - The student form PDF file
 * @throws {Error} - If an error occurs while serving the file
 * @description - This endpoint serves the student form PDF file to the client.
 */
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

/**
 * Endpoint to update a submission's payment status
 * @param {string} id - ID of the submission to update
 * @param {boolean} paid - New payment status
 * @returns {object} - JSON response containing the updated submission
 * @throws {Error} - If an error occurs during the update process
 * @description - This endpoint updates the payment status of a submission in the database using its ID.
 */
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

/**
 * Endpoint to update an event
 * @param {string} id - ID of the event to update
 * @param {object} eventData - New event data
 * @returns {object} - JSON response containing the updated event
 * @throws {Error} - If an error occurs during the update process
 * @description - This endpoint updates an event in the database using its ID.
 */
app.put("/api/events/:id", async (req, res) => {
  try {
    await eventSchema.findByIdAndUpdate(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
});

/**
 * Endpoint to delete an event
 * @param {string} id - ID of the event to delete
 * @throws {Error} - If an error occurs during the deletion process
 * @description - This endpoint deletes an event from the database using its ID.
 */
app.delete("/api/events/:id", auth, async (req, res) => {
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

/**
 * Endpoint to get a specific event by ID
 * @param {string} id - ID of the event to retrieve
 * @returns {object} - JSON response containing the event data
 * @throws {Error} - If an error occurs during the retrieval process
 * @description - This endpoint retrieves a specific event from the database using its ID.
 */
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

/**
 * Endpoint to get all events
 * @param {object} req - Request object
 * @returns {array} - JSON response containing an array of events
 * @throws {Error} - If an error occurs during the retrieval process
 * @description - This endpoint retrieves all events from the database and sorts them by date in descending order.
 */
app.get("/api/events", async (req, res) => {
  try {
    const events = await eventSchema.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

/**
 * Endpoint to create a new event
 * @param {object} req - Request object containing event data
 * @returns {object} - JSON response containing the created event
 * @throws {Error} - If an error occurs during the creation process
 * @description - This endpoint creates a new event in the database.
 */
app.put("/api/events/:id", async (req, res) => {
  try {
    await eventSchema.findByIdAndUpdate(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
});

/**
 * Endpoint to submit a form with an optional file upload
 * @param {object} req - Request object containing form data and file
 * @returns {object} - JSON response indicating success or failure
 * @throws {Error} - If an error occurs during the submission process
 * @description - This endpoint handles form submissions with optional file uploads.
 */
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

/**
 * Endpoint to get all submissions
 * @param {object} req - Request object
 * @returns {array} - JSON response containing an array of submissions
 * @throws {Error} - If an error occurs during the retrieval process
 * @description - This endpoint retrieves all submissions from the database and sorts them by creation date in descending order.
 * @requires auth - Middleware to authenticate the request
 */
app.get("/api/submissions", auth, async (req, res) => {
  try {
    const submissions = await submissionSchema.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

/**
 * Endpoint to get a specific submission by ID
 * @param {string} id - ID of the submission to retrieve
 * @returns {object} - JSON response containing the submission data
 * @throws {Error} - If an error occurs during the retrieval process
 * @description - This endpoint retrieves a specific submission from the database using its ID.
 * @requires auth - Middleware to authenticate the request
 */
app.get("/api/submissions/:id/file", auth, async (req, res) => {
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

app.delete("/api/submissions/:id", auth, async (req, res) => {
  try {
    await submissionSchema.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ message: "Error deleting submission" });
  }
});

/**
 * Endpoint to login a as administrator
 * @param {object} req - Request object containing user data
 * @returns {object} - JSON response indicating success or failure
 * @throws {Error} - If an error occurs during the login process
 * @description - This endpoint handles user login and password hashing.
 */
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

/**
 * Endpoint to check the Python environment and OpenRouter API key
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {object} - JSON response indicating success or failure
 * @throws {Error} - If an error occurs during the environment check
 * @description - This endpoint checks the Python environment and OpenRouter API key configuration.
 * @requires auth - Middleware to authenticate the request
 */
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

// Listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


