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
    const url = password
      ? `${API_BASE}/download/${id}?password=${password}`
      : `${API_BASE}/download/${id}`;

    window.location.href = url;
  };

  if (!info) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>{info.originalName}</h2>
      <p>{(info.size / 1024).toFixed(2)} KB</p>
      <p>Remaining downloads: {info.remainingDownloads}</p>

      {info.passwordProtected && (
        <input
          type="password"
          placeholder="Enter password"
          onChange={e => setPassword(e.target.value)}
        />
      )}

      <button onClick={download}>Download</button>
    </div>
  );
}
