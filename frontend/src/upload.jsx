import { useState, useEffect } from "react";
import { API_BASE, FRONTEND_BASE } from "./config";

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const uploadFile = async () => {
    if (!file) {
      setStatus("Please select a file");
      return;
    }

    setStatus("Uploading...");
    setDownloadLink("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      const link = `${FRONTEND_BASE}/download/${data.fileId}`;
      setDownloadLink(link);
      setStatus("Upload successful");
    } catch (err) {
      setStatus("Upload failed");
    }
  };

  return (
    <div className="page">
      <button className="theme-toggle" onClick={toggleTheme}>
        {document.documentElement.getAttribute("data-theme") === "dark"
          ? "Light"
          : "Dark"}
      </button>

      <div className="card">
        <h2>FLD Share</h2>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button onClick={uploadFile}>Upload</button>

        {status && <p className="warning">{status}</p>}

        {downloadLink && (
          <>
            <p className="success">Share this link</p>
            <input value={downloadLink} readOnly />
            <button
              onClick={() => navigator.clipboard.writeText(downloadLink)}
            >
              Copy Link
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Upload;
