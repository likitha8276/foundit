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
      <div className="w-full max-w-md bg-white p-8 sm:p-9 rounded-3xl border border-theme-border shadow-soft">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-sage-50 text-sage-600 border border-sage-200 flex items-center justify-center mb-3 shadow-xs">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-ink">
            Sign In to Your Account
          </h2>
          <div className="green-bar mx-auto mt-2" />
          <p className="mt-2 text-xs text-ink-muted">
            Lost and Found Management Portal
          </p>
        </div>

        {/* Disabled Account Notice */}
        {wasDisabled && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Account Suspended</p>
              <p className="mt-0.5">Your account has been deactivated by an administrator.</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.in"
                className="w-full pl-10 pr-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-sage-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-0">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-sage-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white font-semibold py-3 px-4 rounded-full transition-all shadow-sm hover:shadow-soft mt-3 flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            <span>Sign In</span>
          </button>
        </form>

        {/* Demo Accounts Bar */}
        <div className="mt-6 pt-5 border-t border-theme-border">
          <p className="text-xs font-semibold text-ink-muted mb-3 text-center uppercase tracking-wider">
            Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('user1@lostfound.local', 'UserPass123!')}
              className="bg-theme-subcard hover:bg-sage-50 border border-theme-border rounded-xl py-2 px-3 text-xs font-semibold text-sage-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-sage-600" />
              <span>Standard User</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@lostfound.local', 'AdminPass123!')}
              className="bg-theme-subcard hover:bg-sage-50 border border-theme-border rounded-xl py-2 px-3 text-xs font-semibold text-ink-muted flex items-center justify-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-sage-600" />
              <span>Administrator</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-ink-muted">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-sage-600 hover:text-sage-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
