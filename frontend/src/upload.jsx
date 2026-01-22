import { useState, useEffect } from "react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
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
    console.log("UPLOAD CLICKED"); // ← must print

    if (!file) {
      setStatus("Please select a file first");
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

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setResult(data);
      setStatus("Upload successful");
    } catch (err) {
      console.error(err);
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
        <p>Fast. Simple. Private.</p>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          type="button"
          onClick={uploadFile}
          style={{ cursor: "pointer" }}
        >
          Upload
        </button>

        {status && <p className="warning">{status}</p>}

        {result && (
          <>
            <p className="success">File uploaded</p>
            <input value={result.downloadLink} readOnly />
            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(result.downloadLink)
              }
            >
              Copy Link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
