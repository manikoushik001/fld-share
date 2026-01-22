import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "./config";

function Download() {
  const { filename } = useParams();
  const navigate = useNavigate();

  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

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

  useEffect(() => {
    fetch(`${API_BASE}/meta/${filename}`)
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then(setFileInfo)
      .catch((e) => setError(e.message));
  }, [filename]);

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/download/${filename}`);
      if (!res.ok) throw new Error(await res.text());
      window.open(`${API_BASE}/download/${filename}`, "_blank");
    } catch (e) {
      alert(e.message);
    }
    setDownloading(false);
  };

  if (error)
    return (
      <div className="page">
        <div className="card">
          <p className="error">{error}</p>
          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );

  if (!fileInfo)
    return (
      <div className="page">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="page">
      <button className="theme-toggle" onClick={toggleTheme}>
        {document.documentElement.getAttribute("data-theme") === "dark"
          ? "Light"
          : "Dark"}
      </button>

      <div className="card">
        <h2>Download File</h2>

        <p>
          <strong>Name:</strong> {fileInfo.originalName}
        </p>
        <p>
          <strong>Size:</strong>{" "}
          {(fileInfo.size / 1024).toFixed(2)} KB
        </p>

        <button onClick={download} disabled={downloading}>
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
  );
}

export default Download;
