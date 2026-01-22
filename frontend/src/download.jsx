import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "./config";

export default function Download() {
  const { id } = useParams();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/meta/${id}`)
      .then(res => res.json())
      .then(setInfo)
      .catch(() => setError("Invalid link"));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!info) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>{info.originalName}</h2>
      <p>{(info.size / 1024).toFixed(1)} KB</p>
      <p>Downloads left: {info.downloadsLeft}</p>

      <button onClick={() => window.location.href = `${API_BASE}/download/${id}`}>
        Download
      </button>
    </div>
  );
}
