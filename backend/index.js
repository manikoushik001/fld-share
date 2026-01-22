const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Multer config
const upload = multer({ dest: UPLOAD_DIR });

// Health check
app.get("/", (req, res) => {
  res.send("FLD Share backend running 🚀");
});

// Upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "Upload successful",
    fileId: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    downloadLink: `${req.protocol}://${req.get("host")}/download/${req.file.filename}`
  });
});

// Download
app.get("/download/:id", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
