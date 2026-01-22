import { useState } from "react";
import "./index.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const uploadFile = async () => {
    if (!file) {
      alert("Select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div className="container">
      <h1>FLD Share</h1>
      <p>Fast. Simple. Private.</p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadFile}>Upload</button>

      {result && (
        <pre className="result">{result}</pre>
      )}
    </div>
  );
}

export default App;
