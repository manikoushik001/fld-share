import express from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------- S3 / R2 ----------
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  }
});

const BUCKET = process.env.R2_BUCKET;

// ---------- Multer (memory) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ---------- In-memory metadata (safe now) ----------
const files = {};

// ---------- Health ----------
app.get("/", (_, res) => {
  res.send("FLD Share backend running");
});

// ---------- Upload ----------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const id = crypto.randomBytes(16).toString("hex");

    const passwordHash = req.body.password
      ? await bcrypt.hash(req.body.password, 10)
      : null;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: id,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      })
    );

    files[id] = {
      originalName: req.file.originalname,
      size: req.file.size,
      passwordHash,
      expiresAt: req.body.expiryMinutes
        ? Date.now() + Number(req.body.expiryMinutes) * 60 * 1000
        : null
    };

    res.json({
      downloadLink: `${req.protocol}://${req.get("host")}/download/${id}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ---------- Metadata ----------
app.get("/meta/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).json({ error: "Not found" });

  if (file.expiresAt && Date.now() > file.expiresAt) {
    return res.status(410).json({ error: "Expired" });
  }

  res.json({
    originalName: file.originalName,
    size: file.size
  });
});

// ---------- Download ----------
app.post("/download/:id", async (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).send("Not found");

  if (file.expiresAt && Date.now() > file.expiresAt) {
    return res.status(410).send("Expired");
  }

  if (file.passwordHash) {
    const ok = await bcrypt.compare(req.body.password || "", file.passwordHash);
    if (!ok) return res.status(401).send("Invalid password");
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: req.params.id,
    ResponseContentDisposition: `attachment; filename="${file.originalName}"`
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  res.json({ url: signedUrl });
});

app.listen(PORT, () => {
  console.log("FLD Share backend running on", PORT);
});
