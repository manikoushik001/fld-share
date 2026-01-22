import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./upload";
import Download from "./download";

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
