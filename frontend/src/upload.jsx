import { useState } from "react";
import { API_BASE } from "./config";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const uploadFile = async () => {
    if (!file) return alert("Select a file");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: form
    });

    const data = await res.json();
    setResult(data.downloadLink);
  };

  return (
    <div className="card">
      <h2>FLD Share</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload</button>

      {result && (
        <>
          <input value={result} readOnly />
          <button onClick={() => navigator.clipboard.writeText(result)}>
            Copy Link
          </button>
        </>
      )}
    </div>
  );
}
