const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

/* ================= STORAGE ================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, __, cb) => {
    cb(null, crypto.randomBytes(16).toString("hex"));
  }
});
const upload = multer({ storage });

/* ================= IN-MEMORY DB ================= */
const files = {};

/* ================= UPLOAD ================= */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const {
    expiryMinutes = 60,
    password = "",
    maxDownloads = 1
  } = req.body;

  const id = req.file.filename;

  files[id] = {
    id,
    path: req.file.path,
    originalName: req.file.originalname,
    size: req.file.size,
    password,
    maxDownloads: Number(maxDownloads),
    downloads: 0,
    expiresAt: Date.now() + Number(expiryMinutes) * 60 * 1000
  };

  res.json({
    downloadLink: `https://fld-share.vercel.app/download/${id}`
  });
});

/* ================= META ================= */
app.get("/meta/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).json({ error: "File not found" });

  if (Date.now() > file.expiresAt)
    return res.status(410).json({ error: "Link expired" });

  res.json({
    originalName: file.originalName,
    size: file.size,
    downloadsLeft: file.maxDownloads - file.downloads
  });
});

/* ================= DOWNLOAD ================= */
app.get("/download/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).send("File not found");

  if (Date.now() > file.expiresAt)
    return res.status(410).send("Link expired");

  if (file.downloads >= file.maxDownloads)
    return res.status(410).send("Download limit reached");

  file.downloads += 1;

  res.download(file.path, file.originalName);
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("FLD Share backend running");
});
