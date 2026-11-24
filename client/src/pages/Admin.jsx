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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Title Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-theme-border shadow-soft">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-sage-800 bg-sage-50 border border-sage-200 rounded-full mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-sage-600" />
          <span>System Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">
          Administrator Control Panel
        </h1>
        <div className="green-bar mt-2" />
        <p className="text-xs text-ink-muted mt-2.5">
          Notice moderation, ownership verification, user privileges, and AI model performance metrics.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs font-semibold flex justify-between items-center shadow-xs">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold text-sage-600 hover:text-sage-800">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex justify-between items-center shadow-xs">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Users', val: stats.totalUsers, color: 'text-ink' },
            { label: 'Lost Items', val: stats.totalLost, color: 'text-amber-600' },
            { label: 'Found Items', val: stats.totalFound, color: 'text-sage-700' },
            { label: 'Matches Made', val: stats.totalMatches, color: 'text-sage-800' },
            { label: 'Returned', val: stats.totalReturned, color: 'text-emerald-600' },
            { label: 'Flagged Items', val: stats.flaggedItems, color: 'text-purple-600' },
          ].map((s, idx) => (
            <div key={idx} className="bg-white border border-theme-border rounded-2xl p-4 text-center shadow-soft">
              <p className="text-xs text-ink-muted font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-theme-border pb-3">
        {[
          { id: 'items', label: 'Item Verification & Moderation' },
          { id: 'users', label: 'User Management' },
          { id: 'audit', label: 'Audit Trail' },
          { id: 'performance', label: 'Model Benchmarks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
              activeTab === tab.id
                ? 'bg-sage-500 text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-ink border border-theme-border hover:border-sage-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ITEM VERIFICATION */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-ink">
              Submitted Items for Moderation
            </h2>
            <span className="text-xs font-semibold text-sage-800 bg-sage-50 border border-sage-200 px-3 py-1 rounded-full">
              {items.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <div key={item._id} className="bg-white border border-theme-border rounded-2xl p-5 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-1">
                    <p className="font-bold text-ink text-sm capitalize">
                      {item.name}
                    </p>
                    <span className={item.status === 'lost' ? 'badge-lost' : 'badge-found'}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-ink-muted">
                    <span className="font-medium text-ink">Poster:</span> {item.userId?.email || 'N/A'}
                  </p>
                  <p className="text-ink-muted">
                    <span className="font-medium text-ink">Category:</span> <span className="capitalize">{item.category}</span>
                  </p>
                  <p className="text-ink-muted">
                    <span className="font-medium text-ink">Moderation:</span>{' '}
                    <span className={`font-semibold capitalize ${
                      item.moderation === 'approved' ? 'text-sage-700' : 'text-amber-600'
                    }`}>
                      {item.moderation}
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-theme-border flex gap-2">
                  <button
                    onClick={() => handleModerateItem(item._id, 'delete')}
                    className="flex-1 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-colors"
                  >
                    Delete
                  </button>
                  {item.moderation !== 'approved' && (
                    <button
                      onClick={() => handleModerateItem(item._id, 'approve')}
                      className="flex-1 py-1.5 text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 rounded-full transition-colors"
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

      {/* TAB 2: USER VERIFICATION */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-ink">
              Registered System Users
            </h2>
            <span className="text-xs font-semibold text-sage-800 bg-sage-50 border border-sage-200 px-3 py-1 rounded-full">
              {users.length} users
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {users.map((u) => {
              const formattedDate = u.joinDate
                ? new Date(u.joinDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Active Member';

              return (
                <div key={u._id} className="bg-white border border-theme-border rounded-2xl p-5 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-ink text-sm">
                      {u.name}
                    </p>
                    <p className="text-ink-muted">
                      <span className="font-medium text-ink">Email:</span> {u.email}
                    </p>
                    <p className="text-ink-muted">
                      <span className="font-medium text-ink">Joined:</span> {formattedDate}
                    </p>
                    <p className="text-ink-muted">
                      <span className="font-medium text-ink">Status:</span>{' '}
                      <span className={`font-semibold ${u.isActive ? 'text-sage-700' : 'text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-theme-border flex gap-2">
                    <button
                      onClick={() => handleToggleUserStatus(u._id)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                        u.isActive
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          : 'text-sage-800 bg-sage-50 hover:bg-sage-100 border border-sage-200'
                      }`}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="py-1.5 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-colors"
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
        <div className="bg-white border border-theme-border rounded-3xl shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-theme-border bg-theme-subcard flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink">
              Administrative Operation Trail
            </h3>
            <span className="text-xs font-semibold text-sage-800 bg-sage-50 border border-sage-200 px-3 py-1 rounded-full">
              {auditLogs.length} events
            </span>
          </div>
          <div className="divide-y divide-theme-border max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="p-8 text-center text-xs text-ink-muted">No admin actions recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="p-4 text-xs flex justify-between items-center hover:bg-theme-subcard/50 transition-colors">
                  <div>
                    <span className="font-bold text-ink mr-2">
                      {log.action}
                    </span>
                    <span className="text-ink-muted">
                      Target: {log.targetType} ({log.targetId})
                    </span>
                    {log.details && (
                      <p className="text-[11px] text-ink-faint mt-0.5">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-ink-muted font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MODEL PERFORMANCE */}
      {activeTab === 'performance' && performance && (
        <div className="space-y-6">
          {/* Summary metrics header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-theme-border rounded-3xl p-5 text-center shadow-soft">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Overall Accuracy</p>
              <p className="text-3xl font-extrabold text-sage-600 mt-1">
                {Math.round(performance.match_accuracy * 100)}%
              </p>
              <p className="text-[11px] text-ink-muted mt-1 font-medium">Benchmark Target: 86.0%</p>
            </div>
            <div className="bg-white border border-theme-border rounded-3xl p-5 text-center shadow-soft">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Precision</p>
              <p className="text-3xl font-extrabold text-ink mt-1">
                {performance.precision}
              </p>
              <p className="text-[11px] text-ink-muted mt-1 font-medium">Benchmark Target: 0.891</p>
            </div>
            <div className="bg-white border border-theme-border rounded-3xl p-5 text-center shadow-soft">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Recall</p>
              <p className="text-3xl font-extrabold text-ink mt-1">
                {performance.recall}
              </p>
              <p className="text-[11px] text-ink-muted mt-1 font-medium">Benchmark Target: 0.922</p>
            </div>
            <div className="bg-white border border-theme-border rounded-3xl p-5 text-center shadow-soft">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">F1-Score</p>
              <p className="text-3xl font-extrabold text-ink mt-1">
                {performance.f1_score}
              </p>
              <p className="text-[11px] text-ink-muted mt-1 font-medium">Benchmark Target: 0.906</p>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Table I: Performance Metrics */}
            <div className="bg-white border border-theme-border rounded-3xl p-6 shadow-soft">
              <h3 className="font-bold text-sm text-ink mb-1">
                Evaluation Metrics (120-Item Sample)
              </h3>
              <div className="green-bar mb-4" />
              <table className="w-full text-xs text-left">
                <thead className="bg-theme-subcard text-ink font-semibold">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">Metric</th>
                    <th className="p-2.5 rounded-r-xl">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  <tr><td className="p-2.5 font-medium text-ink-muted">Total Inputs</td><td className="p-2.5 font-bold text-ink">{performance.total_inputs}</td></tr>
                  <tr><td className="p-2.5 font-medium text-ink-muted">Text-only Inputs</td><td className="p-2.5 text-ink">{performance.breakdown.text_only}</td></tr>
                  <tr><td className="p-2.5 font-medium text-ink-muted">Image-only Inputs</td><td className="p-2.5 text-ink">{performance.breakdown.image_only}</td></tr>
                  <tr><td className="p-2.5 font-medium text-ink-muted">Hybrid Inputs</td><td className="p-2.5 text-ink">{performance.breakdown.hybrid}</td></tr>
                  <tr><td className="p-2.5 font-medium text-ink-muted">Accurate Matches</td><td className="p-2.5 font-bold text-sage-600">{performance.accurate_matches}</td></tr>
                  <tr><td className="p-2.5 font-medium text-ink-muted">Match Accuracy</td><td className="p-2.5 font-bold text-sage-600">{Math.round(performance.match_accuracy * 100)}%</td></tr>
                  <tr><td className="p-2.5 font-medium text-ink-muted">Time per Match</td><td className="p-2.5 text-ink">{performance.time_per_match_sec} sec</td></tr>
                  <tr><td className="p-2.5 font-medium text-ink-muted">System Scalability</td><td className="p-2.5 capitalize text-ink">{performance.scalability}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Table III: Confusion Matrix */}
            <div className="bg-white border border-theme-border rounded-3xl p-6 shadow-soft">
              <h3 className="font-bold text-sm text-ink mb-1">
                Experimental Confusion Matrix
              </h3>
              <div className="green-bar mb-4" />
              <table className="w-full text-xs text-center border border-theme-border rounded-xl overflow-hidden">
                <thead className="bg-theme-subcard text-ink font-semibold">
                  <tr>
                    <th className="p-2.5 border border-theme-border">Actual \ Predicted</th>
                    <th className="p-2.5 border border-theme-border bg-sage-50 text-sage-800">Predicted Match</th>
                    <th className="p-2.5 border border-theme-border bg-theme-bg text-ink-muted">Predicted No-Match</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 border border-theme-border font-medium text-left text-ink">Actual Match</td>
                    <td className="p-2.5 border border-theme-border font-bold text-sage-700 bg-sage-50/60">
                      {performance.confusion_matrix.true_positives} (TP)
                    </td>
                    <td className="p-2.5 border border-theme-border font-bold text-red-600">
                      {performance.confusion_matrix.false_negatives} (FN)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-theme-border font-medium text-left text-ink">Actual No-Match</td>
                    <td className="p-2.5 border border-theme-border font-bold text-red-600">
                      {performance.confusion_matrix.false_positives} (FP)
                    </td>
                    <td className="p-2.5 border border-theme-border font-bold text-sage-700 bg-sage-50/60">
                      {performance.confusion_matrix.true_negatives} (TN)
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 text-[11px] text-ink-muted space-y-1 font-medium">
                <p>• True Positive Rate (Sensitivity): {(performance.confusion_matrix.true_positives / (performance.confusion_matrix.true_positives + performance.confusion_matrix.false_negatives) * 100).toFixed(1)}%</p>
                <p>• Specificity (True Negative Rate): {(performance.confusion_matrix.true_negatives / (performance.confusion_matrix.true_negatives + performance.confusion_matrix.false_positives) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Table IV: Quantitative Comparison */}
          <div className="bg-white border border-theme-border rounded-3xl p-6 shadow-soft">
            <h3 className="font-bold text-sm text-ink mb-1">
              Quantitative Comparison of Systems
            </h3>
            <div className="green-bar mb-4" />
            <table className="w-full text-xs text-left">
              <thead className="bg-theme-subcard font-semibold text-ink">
                <tr>
                  <th className="p-2.5 rounded-l-xl">System</th>
                  <th className="p-2.5">Method</th>
                  <th className="p-2.5 rounded-r-xl">Reported Accuracy (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {performance.comparison_with_baselines.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.system.includes('Proposed') ? 'bg-sage-50/70 font-bold' : ''}
                  >
                    <td className="p-2.5 text-ink">{row.system}</td>
                    <td className="p-2.5 text-ink-muted">{row.method}</td>
                    <td className="p-2.5">
                      <span className={row.system.includes('Proposed') ? 'text-sage-700 font-extrabold' : 'text-ink'}>
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
