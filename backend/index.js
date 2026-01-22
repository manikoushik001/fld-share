const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// In-memory store (simple & reliable for now)
const files = {};

// Multer
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Health
app.get("/", (_, res) => {
  res.send("FLD Share backend running");
});

// Upload
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const { expiryMinutes, password, maxDownloads } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file" });

    const id = crypto.randomBytes(16).toString("hex");

    files[id] = {
      path: req.file.path,
      originalName: req.file.originalname,
      size: req.file.size,
      password: password || null,
      expiresAt: expiryMinutes
        ? Date.now() + Number(expiryMinutes) * 60 * 1000
        : null,
      maxDownloads: maxDownloads ? Number(maxDownloads) : null,
      downloads: 0
    };

    const downloadLink = `${req.protocol}://${req.get("host")}/download/${id}`;

    res.json({
      message: "Upload successful",
      downloadLink
    });
  } catch (e) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Metadata
app.get("/meta/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).json({ error: "Not found" });

  if (file.expiresAt && Date.now() > file.expiresAt) {
    return res.status(410).json({ error: "Expired" });
  }

  res.json({
    originalName: file.originalName,
    size: file.size,
    remaining:
      file.maxDownloads === null
        ? "Unlimited"
        : file.maxDownloads - file.downloads
  });
});

// Download
app.get("/download/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).send("Not found");

  if (file.expiresAt && Date.now() > file.expiresAt) {
    return res.status(410).send("Expired");
  }

  if (file.maxDownloads !== null && file.downloads >= file.maxDownloads) {
    return res.status(410).send("Download limit reached");
  }

  if (file.password && req.query.password !== file.password) {
    return res.status(401).send("Password required or incorrect");
  }

  file.downloads++;

  res.download(file.path, file.originalName, () => {
    if (file.maxDownloads && file.downloads >= file.maxDownloads) {
      fs.unlinkSync(file.path);
      delete files[req.params.id];
    }
  });
});

app.listen(PORT, () => {
  console.log("FLD Share backend running on", PORT);
});
