import { useState } from "react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [downloads, setDownloads] = useState(1);
  const [expiry, setExpiry] = useState(60);
  const [link, setLink] = useState("");

  async function upload() {
    if (!file) return alert("Choose file");

    const data = new FormData();
    data.append("file", file);
    data.append("password", password);
    data.append("maxDownloads", downloads);
    data.append("expiresInMinutes", expiry);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: data
    });

    const json = await res.json();
    setLink(json.downloadLink);
  }

  return (
    <div className="card">
      <h2>FLD Share</h2>

      <input type="file" onChange={e => setFile(e.target.files[0])} />

      <input
        placeholder="Password (optional)"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <input
        type="number"
        min="1"
        max="100"
        value={downloads}
        onChange={e => setDownloads(e.target.value)}
        placeholder="Max downloads"
      />

      <input
        type="number"
        min="1"
        max="1440"
        value={expiry}
        onChange={e => setExpiry(e.target.value)}
        placeholder="Delete after (minutes)"
      />

      <button onClick={upload}>Upload</button>

      {link && (
        <>
          <input value={link} readOnly />
          <button onClick={() => navigator.clipboard.writeText(link)}>
            Copy Link
          </button>
        </>
      )}
    </div>
  );
}
