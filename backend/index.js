const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const BASE_URL = "https://fld-share.vercel.app";

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const files = new Map(); // temporary storage

/* ---------- UTILS ---------- */
const hash = (v) =>
  crypto.createHash("sha256").update(v).digest("hex");

/* ---------- MULTER ---------- */
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_, file, cb) => {
    const id = crypto.randomBytes(16).toString("hex");
    cb(null, id);
  },
});
const upload = multer({ storage });

/* ---------- CLEANUP ---------- */
setInterval(() => {
  const now = Date.now();
  for (const [id, file] of files) {
    if (file.expiresAt && now > file.expiresAt) {
      fs.unlink(file.path, () => {});
      files.delete(id);
    }
  }
}, 60 * 1000);

/* ---------- UPLOAD ---------- */
app.post("/upload", upload.single("file"), (req, res) => {
  const { password, maxDownloads, deleteAfterMinutes } = req.body;

  const id = req.file.filename;

  files.set(id, {
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    passwordHash: password ? hash(password) : null,
    maxDownloads: maxDownloads ? Number(maxDownloads) : null,
    downloads: 0,
    expiresAt: deleteAfterMinutes
      ? Date.now() + Number(deleteAfterMinutes) * 60 * 1000
      : null,
  });

  res.json({
    downloadLink: `${BASE_URL}/download/${id}`,
    passwordRequired: !!password,
  });
});

/* ---------- META ---------- */
app.get("/meta/:id", (req, res) => {
  const file = files.get(req.params.id);
  if (!file) return res.status(404).json({ error: "Not found" });

  res.json({
    originalName: file.originalName,
    size: file.size,
    passwordRequired: !!file.passwordHash,
    remaining:
      file.maxDownloads === null
        ? "∞"
        : Math.max(file.maxDownloads - file.downloads, 0),
    expiresAt: file.expiresAt,
  });
});

/* ---------- DOWNLOAD ---------- */
app.post("/download/:id", (req, res) => {
  const file = files.get(req.params.id);
  if (!file) return res.status(404).send("Link expired or invalid");

  if (file.expiresAt && Date.now() > file.expiresAt) {
    files.delete(req.params.id);
    return res.status(410).send("Link expired");
  }

  if (
    file.maxDownloads !== null &&
    file.downloads >= file.maxDownloads
  ) {
    return res.status(403).send("Download limit reached");
  }

  if (file.passwordHash) {
    if (!req.body.password)
      return res.status(401).send("Password required");

    if (hash(req.body.password) !== file.passwordHash)
      return res.status(403).send("Wrong password");
  }

  file.downloads++;

  res.download(file.path, file.originalName);
});

app.listen(PORT, () =>
  console.log("Backend running on", PORT)
);
