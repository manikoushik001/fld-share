import { useState } from "react";
import QRCode from "qrcode.react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [expires, setExpires] = useState(60);
  const [limit, setLimit] = useState(1);
  const [result, setResult] = useState(null);

  const upload = async () => {
    if (!file) return alert("Select a file");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("password", password);
    fd.append("expiresInMinutes", expires);
    fd.append("maxDownloads", limit);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    setResult(data);
  };

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
        placeholder="Expires (minutes)"
        value={expires}
        onChange={e => setExpires(e.target.value)}
      />

      <input
        type="number"
        placeholder="Max downloads"
        value={limit}
        onChange={e => setLimit(e.target.value)}
      />

      <button onClick={upload}>Upload</button>

      {result && (
        <>
          <input value={result.downloadLink} readOnly />
          <button onClick={() => navigator.clipboard.writeText(result.downloadLink)}>
            Copy Link
          </button>

          <QRCode value={result.downloadLink} size={180} />
        </>
      )}
    </div>
  );
}
