const express = require("express");
const multer = require("multer");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// In-memory metadata store (simple + works on Render)
const files = new Map();

// Multer storage
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(16).toString("hex");
    cb(null, id);
  }
});

const upload = multer({ storage });

// Health check
app.get("/", (req, res) => {
  res.send("FLD Share backend running 🚀");
});

// Upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file");

  const {
    password = "",
    expiresInMinutes = 0,
    maxDownloads = 1
  } = req.body;

  const fileId = req.file.filename;

  files.set(fileId, {
    path: req.file.path,
    originalName: req.file.originalname,
    size: req.file.size,
    password,
    maxDownloads: Number(maxDownloads),
    downloads: 0,
    expiresAt:
      expiresInMinutes > 0
        ? Date.now() + expiresInMinutes * 60 * 1000
        : null
  });

  res.json({
    fileId,
    downloadLink: `https://fld-share.vercel.app/download/${fileId}`
  });
});

// Metadata
app.get("/meta/:id", (req, res) => {
  const file = files.get(req.params.id);
  if (!file) return res.status(404).send("Not found");

  res.json({
    originalName: file.originalName,
    size: file.size,
    expiresAt: file.expiresAt,
    remainingDownloads: file.maxDownloads - file.downloads,
    passwordProtected: !!file.password
  });
});

// Download
app.get("/download/:id", (req, res) => {
  const file = files.get(req.params.id);
  if (!file) return res.status(404).send("Not found");

  if (file.expiresAt && Date.now() > file.expiresAt)
    return res.status(403).send("Expired");

  if (file.downloads >= file.maxDownloads)
    return res.status(403).send("Download limit reached");

  if (file.password && req.query.password !== file.password)
    return res.status(401).send("Wrong password");

  file.downloads++;

  res.download(file.path, file.originalName);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
