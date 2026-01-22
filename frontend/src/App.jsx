import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./Upload";
import Download from "./Download";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/download/:id" element={<Download />} />
      </Routes>
    </BrowserRouter>
  );
}
