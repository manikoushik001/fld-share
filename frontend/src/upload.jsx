import { useState } from "react";
import { API } from "./config";
import { QRCodeCanvas } from "qrcode.react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [expiry, setExpiry] = useState(60);
  const [link, setLink] = useState("");

  async function uploadFile() {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("password", password);
    fd.append("maxDownloads", maxDownloads);
    fd.append("expiryMinutes", expiry);

    const res = await fetch(`${API}/upload`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    setLink(data.downloadLink);
  }

  return (
    <div className="card">
      <h2>FLD Share</h2>

      <input type="file" onChange={e => setFile(e.target.files[0])} />

      <input placeholder="Password (optional)"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <input type="number" value={maxDownloads}
        onChange={e => setMaxDownloads(e.target.value)}
      />

      <input type="number" value={expiry}
        onChange={e => setExpiry(e.target.value)}
      />

      <button onClick={uploadFile}>Upload</button>

      {link && (
        <>
          <input value={link} readOnly />
          <QRCodeCanvas value={link} />
        </>
      )}
    </div>
  );
}
