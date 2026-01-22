import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState("1");
  const [deleteAfter, setDeleteAfter] = useState("60");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");

  const uploadFile = async () => {
    if (!file) return setStatus("Select a file");

    setStatus("Uploading...");
    const form = new FormData();
    form.append("file", file);
    if (password) form.append("password", password);
    form.append("maxDownloads", maxDownloads);
    form.append("deleteAfterMinutes", deleteAfter);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setResult(data);
    setStatus("");
  };

  return (
    <div className="page">
      <div className="card">
        <h2>FLD Share</h2>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <input
          placeholder="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="number"
          min="1"
          max="100"
          value={maxDownloads}
          onChange={(e) => setMaxDownloads(e.target.value)}
        />

        <input
          type="number"
          placeholder="Delete after (minutes)"
          value={deleteAfter}
          onChange={(e) => setDeleteAfter(e.target.value)}
        />

        <button onClick={uploadFile}>Upload</button>

        {status && <p>{status}</p>}

        {result && (
          <>
            <input value={result.downloadLink} readOnly />
            <QRCodeCanvas value={result.downloadLink} size={180} />
          </>
        )}
      </div>
    </div>
  );
}
