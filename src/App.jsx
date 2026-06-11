import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import CataloguePage from "./pages/CataloguePage.jsx";
import GiftPage from "./pages/GiftPage.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<CataloguePage />} />
        <Route path="/catalogue" element={<Navigate to="/demo" replace />} />
        <Route path="/g/:token" element={<GiftPage />} />
      </Routes>
    </HashRouter>
  );
}
