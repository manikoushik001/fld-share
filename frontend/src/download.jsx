import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "./config";

export default function Download() {
  const { filename } = useParams();
  const [meta, setMeta] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/meta/${filename}`)
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => setError("File not found"));
  }, [filename]);

  const download = async () => {
    const res = await fetch(`${API_BASE}/download/${filename}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError(await res.text());
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  if (!meta) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="card">
        <h2>{meta.originalName}</h2>
        <p>Remaining downloads: {meta.remaining}</p>

        {meta.passwordRequired && (
          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <button onClick={download}>Download</button>

        {error && <p>{error}</p>}
      </div>
    </div>
  );
}
