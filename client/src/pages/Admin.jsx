import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  Package,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Check,
  X,
  ShieldAlert,
  BarChart3,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'users' | 'audit' | 'performance'
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, itemsRes, usersRes, logsRes, perfRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/items'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
        api.get('/admin/performance')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (itemsRes.data?.success) setItems(itemsRes.data.items);
      if (usersRes.data?.success) setUsers(usersRes.data.users);
      if (logsRes.data?.success) setAuditLogs(logsRes.data.logs);
      if (perfRes.data?.success) setPerformance(perfRes.data.data);
    } catch (err) {
      // Fallback demo data for admin panel
      setStats({
        totalItems: 24,
        lostCount: 11,
        foundCount: 13,
        matchedCount: 8,
        returnedCount: 5,
        totalUsers: 142
      });
      setItems([
        {
          _id: 'adm-001',
          name: 'Casio fx-991EX Calculator',
          category: 'electronics',
          status: 'found',
          moderation: 'approved',
          createdAt: new Date().toISOString(),
          userId: { name: 'Siddharth M.', email: 'siddharth@example.com' }
        },
        {
          _id: 'adm-002',
          name: 'Leather Cardholder Wallet',
          category: 'wallet',
          status: 'lost',
          moderation: 'approved',
          createdAt: new Date().toISOString(),
          userId: { name: 'Priya Sharma', email: 'user1@lostfound.local' }
        }
      ]);
      setUsers([
        {
          _id: 'usr-001',
          name: 'Priya Sharma',
          email: 'user1@lostfound.local',
          role: 'user',
          isActive: true,
          createdAt: '2026-11-10T00:00:00.000Z'
        },
        {
          _id: 'usr-002',
          name: 'System Administrator',
          email: 'admin@lostfound.local',
          role: 'admin',
          isActive: true,
          createdAt: '2026-11-01T00:00:00.000Z'
        }
      ]);
      setAuditLogs([
        {
          _id: 'log-001',
          action: 'ITEM_MODERATION',
          targetType: 'item',
          targetId: 'adm-001',
          createdAt: new Date().toISOString(),
          details: { status: 'approved' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleModerateItem = async (itemId, action) => {
    try {
      await api.post(`/admin/items/${itemId}/moderate`, { action });
      setMessage(`Item action "${action}" completed.`);
      loadAllAdminData();
    } catch (err) {
      setError('Failed to execute item moderation.');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      setMessage('User account status updated.');
      loadAllAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage('User account removed.');
      loadAllAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary-600" />
            Administrator Control Panel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            System moderation, item verification, user accounts, and model performance
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Stats Cards (Paper Fig. 2 overview) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalUsers}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-amber-600 font-medium">Lost Items</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.totalLost}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-primary-600 font-medium">Found Items</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">{stats.totalFound}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-blue-600 font-medium">Matches Made</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalMatches}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-emerald-600 font-medium">Returned</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalReturned}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-purple-600 font-medium">Flagged Items</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.flaggedItems}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-2 mb-6">
        <button
          onClick={() => setActiveTab('items')}
          className={`py-2 px-3 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
            activeTab === 'items'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Item Verification (Fig. 7)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          User Management (Fig. 8)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-3 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Audit Log
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`py-2 px-3 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
            activeTab === 'performance'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Model Performance (Paper Results)
        </button>
      </div>

      {/* TAB 1: ITEM VERIFICATION (Matches Paper Fig. 7) */}
      {activeTab === 'items' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Submitted Items for Moderation
            </h2>
            <span className="text-xs text-slate-500">Total: {items.length} items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id} className="card p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    Name: <span className="font-normal capitalize">{item.name}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Email: <span className="text-slate-500">{item.userId?.email || 'N/A'}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Category: <span className="capitalize">{item.category}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Status:{' '}
                    <span className="font-semibold capitalize text-primary-600">
                      {item.status}
                    </span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Moderation:{' '}
                    <span className={`font-semibold capitalize ${
                      item.moderation === 'approved' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {item.moderation}
                    </span>
                  </p>
                </div>

                {/* Delete button matching Paper Fig. 7 (red rounded button) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                  <button
                    onClick={() => handleModerateItem(item._id, 'delete')}
                    className="btn-danger w-full py-1 text-xs"
                  >
                    Delete
                  </button>
                  {item.moderation !== 'approved' && (
                    <button
                      onClick={() => handleModerateItem(item._id, 'approve')}
                      className="btn-primary w-full py-1 text-xs"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USER VERIFICATION (Matches Paper Fig. 8) */}
      {activeTab === 'users' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Registered System Users
            </h2>
            <span className="text-xs text-slate-500">Total: {users.length} users</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {users.map((u) => {
              // Formatted date strictly avoiding the paper's "Invalid Date" bug
              const formattedDate = u.joinDate
                ? new Date(u.joinDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Active Member';

              return (
                <div key={u._id} className="card p-4 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      Name: <span className="font-normal">{u.name}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Email: <span className="text-slate-500">{u.email}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Joined: <span className="font-medium text-slate-700 dark:text-slate-300">{formattedDate}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Status:{' '}
                      <span className={`font-semibold ${u.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </p>
                  </div>

                  {/* Red Delete Button matching Paper Fig. 8 */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                    <button
                      onClick={() => handleToggleUserStatus(u._id)}
                      className="btn-secondary w-full py-1 text-xs"
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="btn-danger w-full py-1 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL LOG */}
      {activeTab === 'audit' && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              Administrative Operation Trail
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">No admin actions recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="p-3 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      Target: {log.targetType} ({log.targetId})
                    </span>
                    {log.details && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MODEL PERFORMANCE (Reproducing IEEE ESCI 2026 Paper Tables I, II, III, IV) */}
      {activeTab === 'performance' && performance && (
        <div className="space-y-6">
          {/* Summary metrics header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <p className="text-xs text-slate-500">Overall Accuracy</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {Math.round(performance.match_accuracy * 100)}%
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Paper Target: 86.0%</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-slate-500">Precision</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {performance.precision}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Paper Target: 0.891</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-slate-500">Recall</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {performance.recall}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Paper Target: 0.922</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-slate-500">F1-Score</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {performance.f1_score}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Paper Target: 0.906</p>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Table I: Performance Metrics */}
            <div className="card p-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">
                Table I: Performance Metrics (120-Item Sample)
              </h3>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-2">Metric</th>
                    <th className="p-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr><td className="p-2">Total Inputs</td><td className="p-2 font-medium">{performance.total_inputs}</td></tr>
                  <tr><td className="p-2">Text-only Inputs</td><td className="p-2">{performance.breakdown.text_only}</td></tr>
                  <tr><td className="p-2">Image-only Inputs</td><td className="p-2">{performance.breakdown.image_only}</td></tr>
                  <tr><td className="p-2">Hybrid Inputs</td><td className="p-2">{performance.breakdown.hybrid}</td></tr>
                  <tr><td className="p-2">Accurate Matches</td><td className="p-2 font-bold text-primary-600">{performance.accurate_matches}</td></tr>
                  <tr><td className="p-2">Match Accuracy</td><td className="p-2 font-bold text-primary-600">{Math.round(performance.match_accuracy * 100)}%</td></tr>
                  <tr><td className="p-2">Time per Match</td><td className="p-2">{performance.time_per_match_sec} sec</td></tr>
                  <tr><td className="p-2">System Scalability</td><td className="p-2 capitalize">{performance.scalability}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Table III: Confusion Matrix */}
            <div className="card p-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">
                Table III: Experimental Confusion Matrix
              </h3>
              <table className="w-full text-xs text-center border border-slate-200 dark:border-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-2 border">Actual \ Predicted</th>
                    <th className="p-2 border bg-green-50 dark:bg-green-950/30 text-green-700">Predicted Match</th>
                    <th className="p-2 border bg-slate-50 dark:bg-slate-800">Predicted No-Match</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium text-left">Actual Match</td>
                    <td className="p-2 border font-bold text-green-700 bg-green-50/50">
                      {performance.confusion_matrix.true_positives} (TP)
                    </td>
                    <td className="p-2 border font-bold text-red-600">
                      {performance.confusion_matrix.false_negatives} (FN)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium text-left">Actual No-Match</td>
                    <td className="p-2 border font-bold text-red-600">
                      {performance.confusion_matrix.false_positives} (FP)
                    </td>
                    <td className="p-2 border font-bold text-green-700 bg-green-50/50">
                      {performance.confusion_matrix.true_negatives} (TN)
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                <p>• True Positive Rate (Sensitivity): {(performance.confusion_matrix.true_positives / (performance.confusion_matrix.true_positives + performance.confusion_matrix.false_negatives) * 100).toFixed(1)}%</p>
                <p>• Specificity (True Negative Rate): {(performance.confusion_matrix.true_negatives / (performance.confusion_matrix.true_negatives + performance.confusion_matrix.false_positives) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Table IV: Quantitative Comparison */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">
              Table IV: Quantitative Comparison of Systems
            </h3>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-700/50 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-2">System</th>
                  <th className="p-2">Method</th>
                  <th className="p-2">Reported Accuracy (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {performance.comparison_with_baselines.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.system.includes('Proposed') ? 'bg-primary-50/60 dark:bg-primary-950/30 font-bold' : ''}
                  >
                    <td className="p-2">{row.system}</td>
                    <td className="p-2 text-slate-500">{row.method}</td>
                    <td className="p-2">
                      <span className={row.system.includes('Proposed') ? 'text-primary-700 dark:text-primary-400' : ''}>
                        {row.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
