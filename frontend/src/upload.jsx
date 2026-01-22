import { useState } from "react";
import { API_BASE } from "./config";
import QRCode from "react-qr-code";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState(10);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

  const upload = async () => {
    if (!file) return alert("Select a file");

    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("expiryMinutes", expiry);
    fd.append("password", password);
    fd.append("maxDownloads", maxDownloads);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    setLoading(false);
    setLink(data.downloadLink);
  };

  return (
    <div className="page">
      <div className="card">
        <h2>FLD Share</h2>

        <input type="file" onChange={e => setFile(e.target.files[0])} />

        <input
          type="number"
          placeholder="Expiry (minutes)"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
        />

        <input
          type="text"
          placeholder="Password (optional)"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max downloads"
          value={maxDownloads}
          onChange={e => setMaxDownloads(e.target.value)}
        />

        <button onClick={upload}>
          {loading ? "Uploading..." : "Upload"}
        </button>

        {link && (
          <>
            <input value={link} readOnly />
            <QRCode value={link} />
          </>
        )}
      </div>
    </div>
  );
}
