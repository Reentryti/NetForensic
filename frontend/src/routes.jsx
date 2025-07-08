import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CapturePage from "./pages/Capture";
import AnalysisPage from "./pages/Analyse";
import ReportPage from "./pages/Report";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Verify2fa from './pages/Verify2fa';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/report" element={<ReportPage />} />
        {/* Auth routes */}
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/2fa" element={<Verify2fa/>} />
      </Routes>
    </BrowserRouter>
  );
}
