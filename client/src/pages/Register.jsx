import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, AlertCircle, PackageCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please check your inputs.');
    } finally {
      setLoading(false);
    }
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
            Register New Account
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create an account to report and claim items
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-3.5" onSubmit={handleSubmit}>
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <label className="label">Contact Phone (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 012-3456"
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
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
            <span>Complete Registration</span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
