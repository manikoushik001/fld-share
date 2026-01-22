import { useState } from "react";
import { API_BASE, FRONTEND_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    formData.append("maxDownloads", maxDownloads);
    formData.append("expiryMinutes", expiryMinutes);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message || "Upload failed");
    }

    setLoading(false);
  };

  const downloadUrl = result
    ? `${FRONTEND_BASE}/download/${result.fileId}`
    : "";

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>FLD Share</h1>
        <p style={styles.subtitle}>Fast · Simple · Private</p>

        <label style={styles.drop}>
          Click to choose file
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && <p style={styles.filename}>{file.name}</p>}
        </label>

        <input
          style={styles.input}
          placeholder="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          style={styles.input}
          type="number"
          min="1"
          max="100"
          value={maxDownloads}
          onChange={(e) => setMaxDownloads(e.target.value)}
          placeholder="Max downloads"
        />

        <input
          style={styles.input}
          type="number"
          min="1"
          max="1440"
          value={expiryMinutes}
          onChange={(e) => setExpiryMinutes(e.target.value)}
          placeholder="Delete after (minutes)"
        />

        <button style={styles.button} onClick={uploadFile} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        {result && (
          <>
            <p style={styles.success}>Upload successful</p>

            <input style={styles.link} value={downloadUrl} readOnly />

            <button
              style={styles.copy}
              onClick={() => navigator.clipboard.writeText(downloadUrl)}
            >
              Copy Link
            </button>

            <img
              alt="QR"
              style={{ marginTop: 12 }}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                downloadUrl
              )}`}
            />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f5f5f7",
    fontFamily: "-apple-system, BlinkMacSystemFont",
  },
  card: {
    background: "#fff",
    padding: 32,
    width: 360,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
    textAlign: "center",
  },
  title: { margin: 0 },
  subtitle: { color: "#666", marginBottom: 20 },
  drop: {
    border: "2px dashed #ccc",
    padding: 20,
    borderRadius: 12,
    cursor: "pointer",
    marginBottom: 16,
  },
  filename: { marginTop: 8, fontSize: 12 },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    background: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  success: { color: "green", marginTop: 12 },
  error: { color: "red", marginTop: 12 },
  link: {
    width: "100%",
    marginTop: 10,
    padding: 8,
    fontSize: 12,
  },
  copy: {
    marginTop: 8,
    padding: 8,
    width: "100%",
  },
};
