import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const __dirname = path.resolve();

const app = express();
app.use(cors({
  origin: "https://fld-share.vercel.app"
}));
app.use(express.json());

/* ---------- Mongo ---------- */
mongoose.connect(process.env.MONGO_URI);

/* ---------- Schema ---------- */
const fileSchema = new mongoose.Schema({
  fileId: String,
  originalName: String,
  path: String,
  size: Number,
  password: String,
  maxDownloads: Number,
  downloads: { type: Number, default: 0 },
  expiresAt: Date
});

const File = mongoose.model("File", fileSchema);

/* ---------- Multer ---------- */
const upload = multer({
  dest: "uploads/"
});

/* ---------- Helpers ---------- */
function deleteEverywhere(file) {
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
  return File.deleteOne({ _id: file._id });
}

/* ---------- Routes ---------- */

app.get("/", (_, res) => {
  res.send("FLD Share backend running");
});

/* UPLOAD */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const {
      password,
      maxDownloads,
      expiryMinutes
    } = req.body;

    const fileId = crypto.randomBytes(16).toString("hex");

    const expiresAt = expiryMinutes
      ? new Date(Date.now() + Number(expiryMinutes) * 60 * 1000)
      : null;

    const file = await File.create({
      fileId,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      password: password || null,
      maxDownloads: Number(maxDownloads) || 1,
      expiresAt
    });

    res.json({
      downloadLink: `https://fld-share.vercel.app/download/${file.fileId}`
    });
  } catch {
    res.status(500).send("Upload failed");
  }
});

/* META */
app.get("/meta/:id", async (req, res) => {
  const file = await File.findOne({ fileId: req.params.id });
  if (!file) return res.status(404).send("Not found");

  if (file.expiresAt && Date.now() > file.expiresAt) {
    await deleteEverywhere(file);
    return res.status(410).send("Expired");
  }

  if (file.downloads >= file.maxDownloads) {
    await deleteEverywhere(file);
    return res.status(410).send("Limit reached");
  }

  res.json({
    originalName: file.originalName,
    size: file.size,
    requiresPassword: !!file.password
  });
});

/* DOWNLOAD */
app.post("/download/:id", async (req, res) => {
  const file = await File.findOne({ fileId: req.params.id });
  if (!file) return res.status(404).send("Not found");

  if (file.expiresAt && Date.now() > file.expiresAt) {
    await deleteEverywhere(file);
    return res.status(410).send("Expired");
  }

  if (file.downloads >= file.maxDownloads) {
    await deleteEverywhere(file);
    return res.status(410).send("Limit reached");
  }

  if (file.password && req.body.password !== file.password) {
    return res.status(401).send("Wrong password");
  }

  file.downloads += 1;
  await file.save();

  res.download(path.resolve(file.path), file.originalName, async () => {
    if (file.downloads >= file.maxDownloads) {
      await deleteEverywhere(file);
    }
  });
});

app.listen(5000, () => {
  console.log("Backend running");
});
