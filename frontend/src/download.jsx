import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "./config";

export default function Download() {
  const { id } = useParams();
  const [error, setError] = useState("");

  useEffect(() => {
    window.location.href = `${API_BASE}/download/${id}`;
  }, [id]);

  return (
    <div className="page">
      <div className="card">
        {error ? <p>{error}</p> : <p>Downloading...</p>}
      </div>
    </div>
  );
}
