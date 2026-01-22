import { useState } from "react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [link, setLink] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setStatus("Select a file first");
      return;
    }

    setStatus("Uploading...");
    setLink("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setLink(data.downloadLink);
      setStatus("Upload successful");
    } catch (err) {
      setStatus("Upload failed");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>FLD Share</h2>
        <p>Fast. Simple. Private.</p>

        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={uploadFile}>Upload</button>

        {status && <p>{status}</p>}

        {link && (
          <>
            <input value={link} readOnly />
            <button onClick={() => navigator.clipboard.writeText(link)}>
              Copy Link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
