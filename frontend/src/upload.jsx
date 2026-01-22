import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const uploadFile = async () => {
    if (!file) return setStatus("Select a file");

    setStatus("Uploading...");
    setResult(null);

    const form = new FormData();
    form.append("file", file);
    if (password) form.append("password", password);
    if (maxDownloads) form.append("maxDownloads", maxDownloads);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      setResult(data);
      setStatus("");
    } catch {
      setStatus("Upload failed");
    }
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
          placeholder="Max downloads (optional)"
          value={maxDownloads}
          onChange={(e) => setMaxDownloads(e.target.value)}
        />

        <button onClick={uploadFile}>Upload</button>

        {status && <p>{status}</p>}

        {result && (
          <>
            <input value={result.downloadLink} readOnly />
            <button
              onClick={() =>
                navigator.clipboard.writeText(result.downloadLink)
              }
            >
              Copy Link
            </button>

            <QRCodeCanvas value={result.downloadLink} size={180} />
          </>
        )}
      </div>
    </div>
  );
}
