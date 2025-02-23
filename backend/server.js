const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Update CORS configuration
const corsOptions = {
  origin: 'http://127.0.0.1:3000',
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept"
};

app.use(cors(corsOptions));



// Mongo URI
const mongoURI =
  "mongodb+srv://admin:admin@cluster0.egsdr.mongodb.net/transactiontestdb";

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Init gfs
let gfs;

conn.once("open", () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      bucketName: "uploads", // collection name
      filename: file.originalname,
    };
  },
});

const upload = multer({ storage });

// Import mongoose model
const File = require("./models/file");

// @route POST /submit
// @desc Save form data to database
app.post("/submit", async (req, res) => {
  const { filename, path, size, contentType } = req.body;
  const newFile = new File({
    filename,
    path,
    size,
    contentType,
  });

  try {
    const savedFormData = await newFile.save();
    res.json(savedFormData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route GET /files
// @desc  Display all files in JSON
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }

    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    return res.json(file);
  });
});

// @route GET /file/:filename
// @desc  Download single file
app.get("/file/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }

    // Check if file
    if (file.contentType === "application/pdf") {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not a PDF",
      });
    }
  });
});



const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
