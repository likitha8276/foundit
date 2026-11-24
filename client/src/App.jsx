import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadItem from './pages/UploadItem';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ItemDetail from './pages/ItemDetail';

// Real-time Notification Toast Banner
function RealtimeToast() {
  const { latestToast, dismissToast } = useSocket();

  if (!latestToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl bg-white border border-sage-300 shadow-lift flex items-start gap-3 transition-all animate-bounce-subtle">
      <div className="w-9 h-9 rounded-full bg-sage-100 text-sage-700 border border-sage-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
        ✓
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-ink uppercase tracking-wide">
          {latestToast.title}
        </h4>
        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
          {latestToast.message}
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <a
            href="/dashboard"
            onClick={dismissToast}
            className="text-xs font-semibold text-sage-600 hover:text-sage-700 hover:underline"
          >
            Open in Dashboard &rarr;
          </a>
          <button
            onClick={dismissToast}
            className="text-xs text-ink-faint hover:text-ink ml-auto"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-theme-bg text-ink font-sans selection:bg-sage-200 selection:text-sage-900">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/item/:id" element={<ItemDetail />} />
                  <Route path="/upload" element={<UploadItem />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute adminOnly>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <RealtimeToast />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
