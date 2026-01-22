import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API } from "./config";

export default function Download() {
  const { id } = useParams();
  const [meta, setMeta] = useState(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch(`${API}/meta/${id}`)
      .then(r => r.json())
      .then(setMeta)
      .catch(() => setMeta(null));
  }, [id]);

  async function download() {
    const res = await fetch(`${API}/download/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = meta.originalName;
    a.click();
  }

  if (!meta) return <p>Invalid or expired</p>;

  return (
    <div className="card">
      <h2>{meta.originalName}</h2>
      {meta.requiresPassword && (
        <input
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      )}
      <button onClick={download}>Download</button>
    </div>
  );
}
