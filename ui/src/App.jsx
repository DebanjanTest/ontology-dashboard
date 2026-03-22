import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import RiskDashboard from './pages/RiskDashboard';
import IntelligenceGraph from './pages/IntelligenceGraph';
import FeedMonitor from './pages/FeedMonitor';
import NLQuery from './pages/NLQuery';
import RiskAnalyzer from './pages/RiskAnalyzer';
import SettingsPage from './pages/SettingsPage';
import SimplePage from './pages/SimplePage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/risk-dashboard" element={<RiskDashboard />} />
          <Route path="/graph" element={<IntelligenceGraph />} />
          <Route path="/feed" element={<FeedMonitor />} />
          <Route path="/query" element={<NLQuery />} />
          <Route path="/analyzer" element={<RiskAnalyzer />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SimplePage title="Support" activePage="Support" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
