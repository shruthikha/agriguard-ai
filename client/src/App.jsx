import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import OfflineBanner from './components/OfflineBanner';
import DemoPickerModal from './components/DemoPickerModal';
import LanguageModal from './components/LanguageModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';

// Pages
import LandingPage from './pages/LandingPage';
import DetectPage from './pages/DetectPage';
import ScanResultPage from './pages/ScanResultPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import WeatherPage from './pages/WeatherPage';
import AdvisoriesPage from './pages/AdvisoriesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-agri-200 border-t-agri-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading AgriGuard AI...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const handleDemoSelect = (sample) => {
    setSelectedDemo(sample);
    setDemoModalOpen(false);
    navigate('/detect');
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <OfflineBanner />
      {!isAuthPage && (
        <Navbar
          onOpenLanguageModal={() => setLanguageModalOpen(true)}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
        />
      )}

      <main className={`flex-1 ${!isAuthPage && !isAdminPage ? 'pb-20 sm:pb-0' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onOpenDemoModal={() => setDemoModalOpen(true)}
                onOpenLanguageModal={() => setLanguageModalOpen(true)}
              />
            }
          />
          <Route
            path="/detect"
            element={
              <DetectPage
                onScanResult={(result) => setScanResult(result)}
                onOpenDemoModal={() => setDemoModalOpen(true)}
                selectedDemo={selectedDemo}
                onDemoConsumed={() => setSelectedDemo(null)}
              />
            }
          />
          <Route
            path="/result/:scanId"
            element={<ScanResultPage scanResult={scanResult} />}
          />
          <Route
            path="/dashboard"
            element={<DashboardPage onOpenVoiceModal={() => setVoiceModalOpen(true)} />}
          />
          <Route
            path="/history"
            element={<HistoryPage />}
          />
          <Route
            path="/weather"
            element={<WeatherPage />}
          />
          <Route
            path="/advisories"
            element={<AdvisoriesPage />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && !isAdminPage && <Footer />}
      {!isAuthPage && <BottomNav onOpenVoiceModal={() => setVoiceModalOpen(true)} />}

      {/* Global Modals */}
      <DemoPickerModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSelectDemo={handleDemoSelect}
      />
      <LanguageModal
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  );
}
