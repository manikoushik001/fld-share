const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();

// Allow frontend
app.use(cors({
  origin: "*"
}));

// Storage config
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Health check
app.get("/", (req, res) => {
  res.send("FLD Share backend running 🚀");
});

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "Upload successful",
    originalName: req.file.originalname,
    fileId: req.file.filename
  });
});


const fs = require("fs");

app.get("/download/:id", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath);
});

// Download route
app.get("/download/:id", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.id);
  res.download(filePath);
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
