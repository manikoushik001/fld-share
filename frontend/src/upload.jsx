import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const uploadFile = async () => {
    if (!file) {
      setStatus("Please select a file");
      return;
    }

    setStatus("Uploading...");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setResult(data);
      setStatus("");
    } catch (err) {
      setStatus("Upload failed");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>FLD Share</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={uploadFile}>Upload</button>

        {status && <p className="warning">{status}</p>}

        {result && (
          <>
            <p className="success">Upload successful</p>

            <input value={result.downloadLink} readOnly />

            <button
              onClick={() =>
                navigator.clipboard.writeText(result.downloadLink)
              }
            >
              Copy Link
            </button>

            <div style={{ marginTop: "20px" }}>
              <QRCodeCanvas
                value={result.downloadLink}
                size={180}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
