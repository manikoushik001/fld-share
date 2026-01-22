import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "./config";

function Download() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/meta/${filename}`)
      .then(res => {
        if (!res.ok) throw new Error("File not found");
      })
      .catch(err => setError(err.message));
  }, [filename]);

  if (error) {
    return (
      <div className="page">
        <div className="card">
          <p className="error">{error}</p>
          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Download File</h2>

        <button
          onClick={() =>
            window.location.href = `${API_BASE}/download/${filename}`
          }
        >
          Download
        </button>
      </div>
    </div>
  );
}

export default Download;
