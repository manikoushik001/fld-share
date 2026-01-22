import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE } from "./config";

export default function Download() {
  const { id } = useParams();
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/meta/${id}`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setError("File not found"));
  }, [id]);

  const download = async () => {
    setError("");

    const res = await fetch(`${API_BASE}/download/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError(await res.text());
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = info.originalName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!info) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={{ ...styles.page }}>
      <div style={styles.card}>
        <h2>{info.originalName}</h2>
        <p>Size: {(info.size / 1024).toFixed(2)} KB</p>
        <p>Downloads left: {info.remaining}</p>

        {info.passwordProtected && (
          <input
            style={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <button style={styles.button} onClick={download}>
          Download
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
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
    fontFamily: "-apple-system",
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    textAlign: "center",
    width: 340,
  },
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
  },
};
