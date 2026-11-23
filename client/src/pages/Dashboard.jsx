import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  PlusCircle,
  LogOut,
  CheckCircle2,
  Clock,
  Check,
  X,
  Phone,
  User,
  Trash2,
  AlertCircle,
  Tag,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'lost' | 'found' | 'returned'
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  const justReported = new URLSearchParams(location.search).get('reported');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, matchesRes] = await Promise.all([
        api.get('/items?mine=true'),
        api.get('/matches/my')
      ]);

      if (itemsRes.data?.success) setItems(itemsRes.data.items || []);
      if (matchesRes.data?.success) setMatches(matchesRes.data.matches || []);
    } catch (err) {
      setError('Failed to load your items and matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaim = async (matchId) => {
    try {
      const res = await api.post(`/matches/${matchId}/claim`);
      if (res.data?.success) {
        setActionMessage('Claim submitted! Waiting for finder verification.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.');
    }
  };

  const handleConfirm = async (matchId) => {
    try {
      const res = await api.post(`/matches/${matchId}/confirm`);
      if (res.data?.success) {
        setActionMessage('Match confirmed! Both items marked as Returned.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm match.');
    }
  };

  const handleReject = async (matchId) => {
    try {
      const res = await api.post(`/matches/${matchId}/reject`);
      if (res.data?.success) {
        setActionMessage('Claim declined. Item returned to Searching state.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline claim.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      setActionMessage('Item deleted.');
      fetchData();
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  const handleMarkReturned = async (itemId) => {
    try {
      await api.put(`/items/${itemId}`, { state: 'returned' });
      setActionMessage('Item marked as Returned.');
      fetchData();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  // Find match associated with a given item
  const getMatchForItem = (item) => {
    return matches.find(
      (m) =>
        String(m.lostItemId?._id || m.lostItemId) === String(item._id) ||
        String(m.foundItemId?._id || m.foundItemId) === String(item._id)
    );
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'lost') return item.status === 'lost' && item.state !== 'returned';
    if (activeTab === 'found') return item.status === 'found' && item.state !== 'returned';
    if (activeTab === 'returned') return item.state === 'returned';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header / Action Bar (Paper Fig. 6 style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Uploaded Items
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Logged in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="btn-primary flex items-center gap-1.5 py-2 px-4 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Item</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn-secondary py-2 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {justReported && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Your item report was successfully recorded and submitted for matching.</span>
        </div>
      )}

      {actionMessage && (
        <div className="mt-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-xs font-bold text-primary-600">✕</button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs font-bold text-red-600">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-primary-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'lost'
              ? 'bg-primary-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Lost Items ({items.filter((i) => i.status === 'lost' && i.state !== 'returned').length})
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'found'
              ? 'bg-primary-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Found Items ({items.filter((i) => i.status === 'found' && i.state !== 'returned').length})
        </button>
        <button
          onClick={() => setActiveTab('returned')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'returned'
              ? 'bg-primary-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Returned ({items.filter((i) => i.state === 'returned').length})
        </button>
      </div>

      {/* Items Grid (Matching Paper Fig. 6) */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading your items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card mt-6 p-12 text-center text-slate-500">
          <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <h3 className="font-semibold text-base text-slate-700 dark:text-slate-300">No items found in this section</h3>
          <p className="text-xs mt-1 text-slate-400">Have you lost or found something? Submit a report to begin matching.</p>
          <Link to="/upload" className="btn-primary mt-4 text-xs py-2 px-4">
            Report an Item Now
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const match = getMatchForItem(item);
            const isLost = item.status === 'lost';

            return (
              <div
                key={item._id}
                className="card overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                {/* Image / Header */}
                <div>
                  {item.imageUrl ? (
                    <div className="h-44 w-full bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-slate-100 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <Tag className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Body (Matching Paper Fig. 6 structure) */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize">
                        {item.name}
                      </h3>
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          item.state === 'returned'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            : item.status === 'found'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.state === 'returned' ? 'bg-slate-500' : item.status === 'found' ? 'bg-green-600' : 'bg-amber-600'
                        }`} />
                        {item.state === 'returned' ? 'Returned' : item.status === 'found' ? 'Found' : 'Finding'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-500">Category:</span> {item.category}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-500">Description:</span> {item.description}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Date: {new Date(item.date).toLocaleDateString()}</span>
                    </p>

                    {/* MATCH SECTION (Matching Paper Fig. 6) */}
                    {match && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800/60 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-green-800 dark:text-green-300">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            A match has been found!
                          </span>
                          <span className="text-[11px] bg-green-200 dark:bg-green-900 px-1.5 py-0.2 rounded font-bold">
                            {Math.round(match.finalScore * 100)}% Match
                          </span>
                        </div>

                        {/* Matched item photo preview */}
                        {match.foundItemId?.imageUrl && (
                          <div className="w-16 h-16 rounded border border-green-200 dark:border-green-800 overflow-hidden bg-white">
                            <img
                              src={match.foundItemId.imageUrl}
                              alt="Matched Item"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Finder's details (Conditionally revealed to Lost item owner) */}
                        {isLost && match.foundItemId?.contact && (
                          <div className="text-xs text-green-900 dark:text-green-200 pt-1 border-t border-green-200 dark:border-green-800/50 space-y-0.5">
                            <p>
                              <span className="font-semibold">Finder's Name:</span>{' '}
                              {match.foundItemId.contact.name || 'Anonymous Finder'}
                            </p>
                            <p>
                              <span className="font-semibold">Phone Number:</span>{' '}
                              {match.foundItemId.contact.phone || 'Contact via Portal'}
                            </p>
                          </div>
                        )}

                        {/* Claim actions */}
                        <div className="pt-2">
                          {isLost ? (
                            match.state === 'suggested' ? (
                              <button
                                onClick={() => handleClaim(match._id)}
                                className="w-full btn-primary py-1.5 text-xs font-semibold"
                              >
                                This is mine (Request Claim)
                              </button>
                            ) : match.state === 'claimed' ? (
                              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Claim pending finder confirmation
                              </span>
                            ) : match.state === 'confirmed' ? (
                              <span className="text-[11px] text-green-700 dark:text-green-300 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Claim Confirmed & Returned
                              </span>
                            ) : (
                              <span className="text-[11px] text-red-600 font-medium">Claim was declined</span>
                            )
                          ) : (
                            /* Finder view */
                            match.state === 'claimed' ? (
                              <div className="space-y-1.5">
                                <p className="text-[11px] text-amber-800 dark:text-amber-200 font-semibold">
                                  Owner claimed this item. Please verify:
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleConfirm(match._id)}
                                    className="flex-1 btn-primary py-1 text-xs"
                                  >
                                    Confirm Return
                                  </button>
                                  <button
                                    onClick={() => handleReject(match._id)}
                                    className="flex-1 btn-secondary text-xs text-red-600 py-1"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            ) : match.state === 'confirmed' ? (
                              <span className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Successfully Returned
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                Matched with reported lost item
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 dark:bg-slate-750 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  {item.state !== 'returned' ? (
                    <button
                      onClick={() => handleMarkReturned(item._id)}
                      className="text-primary-700 dark:text-primary-400 hover:underline font-medium"
                    >
                      Mark as Returned
                    </button>
                  ) : (
                    <span className="text-slate-400">Completed</span>
                  )}

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
