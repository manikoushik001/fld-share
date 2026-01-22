import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE } from "./config";

export default function Download() {
  const { id } = useParams();
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/meta/${id}`)
      .then(r => r.json())
      .then(setInfo);
  }, [id]);

  const download = async () => {
    const res = await fetch(`${API_BASE}/download/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  if (!info) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>{info.originalName}</h2>
      <input
        placeholder="Password (if any)"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={download}>Download</button>
    </div>
  );
}
