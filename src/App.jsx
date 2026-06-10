import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CataloguePage from "./pages/CataloguePage.jsx";
import GiftPage from "./pages/GiftPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/catalogue" element={<Navigate to="/" replace />} />
        <Route path="/g/:token" element={<GiftPage />} />
      </Routes>
    </BrowserRouter>
  );
}
