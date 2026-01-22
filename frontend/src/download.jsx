import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const download = () => {
    window.open(
      `${API_BASE}/download/${id}?password=${encodeURIComponent(password)}`,
      "_blank"
    );
  };

  if (!info) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="card">
        <h2>{info.originalName}</h2>
        <p>Remaining downloads: {info.remaining}</p>

        <input
          placeholder="Password (if required)"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={download}>Download</button>
      </div>
    </div>
  );
}
