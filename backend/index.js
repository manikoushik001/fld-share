const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://fld-share.vercel.app"
}));

app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const id = uuid();
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({ storage });

/* in-memory DB (simple + reliable for now) */
const files = {};

/* UPLOAD */
app.post("/upload", upload.single("file"), async (req, res) => {
  const {
    password,
    maxDownloads = 1,
    expiresInMinutes = 60
  } = req.body;

  const id = path.parse(req.file.filename).name;

  const hashedPassword = password
    ? await bcrypt.hash(password, 10)
    : null;

  files[id] = {
    path: req.file.path,
    originalName: req.file.originalname,
    password: hashedPassword,
    maxDownloads: Number(maxDownloads),
    downloads: 0,
    expiresAt: Date.now() + Number(expiresInMinutes) * 60 * 1000
  };

  res.json({
    downloadLink: `https://fld-share.vercel.app/download/${id}`
  });
});

/* METADATA */
app.get("/meta/:id", (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).json({ error: "Not found" });

  if (Date.now() > file.expiresAt) {
    cleanup(req.params.id);
    return res.status(410).json({ error: "Expired" });
  }

  res.json({
    name: file.originalName,
    remaining: file.maxDownloads - file.downloads
  });
});

/* DOWNLOAD */
app.post("/download/:id", async (req, res) => {
  const file = files[req.params.id];
  if (!file) return res.status(404).send("Not found");

  if (Date.now() > file.expiresAt) {
    cleanup(req.params.id);
    return res.status(410).send("Expired");
  }

  if (file.downloads >= file.maxDownloads) {
    cleanup(req.params.id);
    return res.status(410).send("Download limit reached");
  }

  if (file.password) {
    const ok = await bcrypt.compare(req.body.password || "", file.password);
    if (!ok) return res.status(401).send("Wrong password");
  }

  file.downloads++;

  res.download(file.path, file.originalName, () => {
    if (file.downloads >= file.maxDownloads) cleanup(req.params.id);
  });
});

function cleanup(id) {
  if (!files[id]) return;
  fs.unlink(files[id].path, () => {});
  delete files[id];
}

app.listen(PORT, () =>
  console.log(`Backend running on ${PORT}`)
);
