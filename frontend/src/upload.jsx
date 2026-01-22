import { useState } from "react";
import { API_BASE } from "./config";
import QRCode from "react-qr-code";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState(60);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");

  const upload = async () => {
    if (!file) return setStatus("Select a file");

    const form = new FormData();
    form.append("file", file);
    form.append("expiryMinutes", expiry);
    form.append("password", password);
    form.append("maxDownloads", maxDownloads);

    setStatus("Uploading...");

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: form
    });

    const data = await res.json();
    setLink(data.downloadLink);
    setStatus("Done");
  };

  return (
    <div className="card">
      <h2>FLD Share</h2>

      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <input type="number" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="Expiry (min)" />
      <input type="password" placeholder="Password (optional)" onChange={e => setPassword(e.target.value)} />
      <input type="number" value={maxDownloads} onChange={e => setMaxDownloads(e.target.value)} placeholder="Max downloads" />

      <button onClick={upload}>Upload</button>

      <p>{status}</p>

      {link && (
        <>
          <input value={link} readOnly />
          <QRCode value={link} />
        </>
      )}
    </div>
  );
}
