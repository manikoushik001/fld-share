import { useState, useEffect } from "react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      localStorage.getItem("theme") || "light"
    );
  }, []);

  const toggleTheme = () => {
    const t =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  };

  const upload = async () => {
    if (!file) return setStatus("Select a file first");

    setStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    setLink(data.downloadLink);
    setStatus("");
  };

  return (
    <div className="page">
      <button className="theme-toggle" onClick={toggleTheme}>Theme</button>
      <div className="card">
        <h2>FLD Share</h2>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={upload}>Upload</button>

        {status && <p className="warning">{status}</p>}
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
