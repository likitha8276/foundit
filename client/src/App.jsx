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
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-primary-600 shadow-xl flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
        ✓
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
          {latestToast.title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
          {latestToast.message}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <a
            href="/dashboard"
            onClick={dismissToast}
            className="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline"
          >
            Open in Dashboard &rarr;
          </a>
          <button
            onClick={dismissToast}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto"
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
            <div className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-rust/20 selection:text-ink">
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
