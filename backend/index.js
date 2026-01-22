const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// in-memory DB (replace later with MongoDB)
const files = {};

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(16).toString("hex");
    cb(null, id);
  }
});

const upload = multer({ storage });

/* UPLOAD */
app.post("/upload", upload.single("file"), (req, res) => {
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
    expiresAt: Date.now() + expiryMinutes * 60 * 1000
  };

  res.json({
    downloadLink: `https://fldshare.vercel.app/download/${id}`
  });
});

/* META */
app.get("/meta/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).json({ error: "Not found" });

  if (Date.now() > file.expiresAt)
    return res.status(410).json({ error: "Expired" });

  res.json({
    originalName: file.originalName,
    size: file.size,
    downloadsLeft: file.maxDownloads - file.downloads
  });
});

/* DOWNLOAD */
app.get("/download/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).send("Not found");

  if (Date.now() > file.expiresAt)
    return res.status(410).send("Expired");

  if (file.downloads >= file.maxDownloads)
    return res.status(410).send("Download limit reached");

  file.downloads++;

  res.download(file.path, file.originalName);
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
