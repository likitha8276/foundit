import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, PackageCheck, UserCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';
  const wasDisabled = new URLSearchParams(location.search).get('disabled');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-lg bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 flex items-center justify-center mb-3">
            <PackageCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sign In to Your Account
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Lost and Found Management Portal
          </p>
        </div>

        {/* Disabled Account Notice */}
        {wasDisabled && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs">Account Suspended</p>
              <p className="text-xs mt-0.5">Your account has been deactivated by an administrator.</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            <span>Sign In</span>
          </button>
        </form>

        {/* Demo Accounts Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5 text-center">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('user1@lostfound.local', 'UserPass123!')}
              className="btn-secondary py-1.5 text-xs flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-primary-600" />
              <span>Standard User</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@lostfound.local', 'AdminPass123!')}
              className="btn-secondary py-1.5 text-xs flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Administrator</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
