import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "./config";

export default function Download() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/meta/${id}`)
      .then(r => r.json())
      .then(setFile)
      .catch(() => setError("File not found"));
  }, [id]);

  const download = () => {
    window.open(`${API_BASE}/download/${id}`, "_blank");
  };

  if (error) return <p>{error}</p>;
  if (!file) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="card">
        <h2>{file.originalName}</h2>
        <p>{(file.size / 1024).toFixed(2)} KB</p>
        <button onClick={download}>Download</button>
      </div>
    </div>
  );
}
