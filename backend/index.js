const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());

/* ---------- STORAGE ---------- */
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

/* ---------- TEST ---------- */
app.get("/", (req, res) => {
  res.send("FLD Share backend running");
});

/* ---------- UPLOAD ---------- */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileId = crypto.randomBytes(16).toString("hex");

  const newPath = path.join("uploads", fileId);
  fs.renameSync(req.file.path, newPath);

  res.json({
    message: "Upload successful",
    originalName: req.file.originalname,
    fileId
  });
});

/* ---------- META ---------- */
app.get("/meta/:id", (req, res) => {
  const filePath = path.join("uploads", req.params.id);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.json({ exists: true });
});

/* ---------- DOWNLOAD ---------- */
app.get("/download/:id", (req, res) => {
  const filePath = path.join("uploads", req.params.id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // IMPORTANT: force browser to download
  res.download(filePath);
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
