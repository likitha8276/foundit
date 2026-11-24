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
      // Fallback demo items for demo session
      setItems([
        {
          _id: 'user-item-001',
          name: 'Black Leather Bifold Wallet',
          category: 'wallet',
          description: 'Black leather bifold wallet with transit pass and cards.',
          date: '2026-11-21',
          status: 'lost',
          state: 'matched',
          location: { name: 'Metro Station Concourse' }
        },
        {
          _id: 'user-item-002',
          name: 'Casio Scientific Calculator',
          category: 'electronics',
          description: 'Casio fx-991EX Classwiz calculator with slide-on case.',
          date: '2026-11-20',
          status: 'found',
          state: 'searching',
          location: { name: 'Public Library 2nd Floor' }
        }
      ]);
      setMatches([
        {
          _id: 'match-001',
          lostItemId: { _id: 'user-item-001', name: 'Black Leather Bifold Wallet' },
          foundItemId: {
            _id: 'found-item-001',
            name: 'Found Leather Wallet',
            description: 'Found black leather wallet near metro station ticket kiosks.',
            location: { name: 'Metro Station Ticket Kiosks' },
            contact: { name: 'Ganga Raman', phone: '+91 98451 23456' }
          },
          finalScore: 0.89,
          state: 'suggested'
        }
      ]);
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Profile / User Banner (Matching the reference screenshot style) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-theme-border shadow-soft flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-sage-100 border-2 border-sage-300 p-1 flex items-center justify-center text-3xl shadow-xs">
            🌱
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-bold text-sage-800 bg-sage-50 border border-sage-200 rounded-full">
              <span>Community Member</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">
              {user?.name || 'Community Member'}
            </h1>
            <div className="green-bar mx-auto sm:mx-0 mt-1" />
            <p className="text-xs text-ink-muted pt-1">
              Email: <span className="font-medium text-ink">{user?.email}</span> {user?.phone && `· Phone: ${user?.phone}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs rounded-full shadow-xs transition-all hover:shadow-soft"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Item</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {justReported && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sage-600" />
          <span>Your item report was successfully recorded and submitted to the AI matching engine.</span>
        </div>
      )}

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs font-medium flex items-center justify-between shadow-xs">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-xs font-bold text-sage-600 hover:text-sage-800">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs font-bold text-red-600">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-theme-border pb-3">
        {[
          { id: 'all', label: `All Items (${items.length})` },
          { id: 'lost', label: `Lost Items (${items.filter((i) => i.status === 'lost' && i.state !== 'returned').length})` },
          { id: 'found', label: `Found Items (${items.filter((i) => i.status === 'found' && i.state !== 'returned').length})` },
          { id: 'returned', label: `Returned (${items.filter((i) => i.state === 'returned').length})` },
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

      {/* Items Grid */}
      {loading ? (
        <div className="py-16 text-center text-ink-muted bg-white rounded-3xl border border-theme-border shadow-soft">
          <div className="w-8 h-8 border-3 border-sage-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading your items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-theme-border p-12 text-center text-ink-muted shadow-soft space-y-3">
          <Layers className="w-10 h-10 mx-auto text-sage-300" />
          <h3 className="font-bold text-base text-ink">No items found in this section</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">Have you lost or found something? Submit a report to begin matching.</p>
          <div className="pt-2">
            <Link to="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs rounded-full shadow-xs">
              Report an Item Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const match = getMatchForItem(item);
            const isLost = item.status === 'lost';

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-theme-border shadow-soft hover:shadow-lift transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Image / Header */}
                <div>
                  {item.imageUrl ? (
                    <div className="h-44 w-full bg-theme-bg border-b border-theme-border overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-theme-bg border-b border-theme-border flex items-center justify-center text-sage-300">
                      <Tag className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base text-ink capitalize">
                        {item.name}
                      </h3>
                      <span
                        className={
                          item.state === 'returned'
                            ? 'badge-claimed'
                            : item.status === 'found'
                            ? 'badge-found'
                            : 'badge-lost'
                        }
                      >
                        {item.state === 'returned' ? 'Returned' : item.status === 'found' ? 'Found' : 'Searching'}
                      </span>
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="text-xs text-ink-muted flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-sage-600" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>

                    {/* MATCH SECTION */}
                    {match && (
                      <div className="mt-3 p-4 bg-sage-50 rounded-2xl border border-sage-200 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-sage-800">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-sage-600" />
                            A match was identified!
                          </span>
                          <span className="badge-found text-[10px]">
                            {Math.round(match.finalScore * 100)}% Match
                          </span>
                        </div>

                        {/* Matched item photo preview */}
                        {match.foundItemId?.imageUrl && (
                          <div className="w-16 h-16 rounded-xl border border-sage-200 overflow-hidden bg-white">
                            <img
                              src={match.foundItemId.imageUrl}
                              alt="Matched Item"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Finder's details (Conditionally revealed to Lost item owner) */}
                        {isLost && match.foundItemId?.contact && (
                          <div className="text-xs text-sage-900 pt-2 border-t border-sage-200 space-y-1">
                            <p>
                              <span className="font-semibold">Finder:</span>{' '}
                              {match.foundItemId.contact.name || 'Anonymous Finder'}
                            </p>
                            <p>
                              <span className="font-semibold">Phone:</span>{' '}
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
                                className="w-full py-2 bg-sage-500 hover:bg-sage-600 text-white rounded-full text-xs font-semibold shadow-xs transition-colors"
                              >
                                This is mine (Request Claim)
                              </button>
                            ) : match.state === 'claimed' ? (
                              <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Claim pending finder confirmation
                              </span>
                            ) : match.state === 'confirmed' ? (
                              <span className="text-[11px] text-sage-800 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-sage-600" /> Claim Confirmed &amp; Returned
                              </span>
                            ) : (
                              <span className="text-[11px] text-red-600 font-medium">Claim was declined</span>
                            )
                          ) : (
                            /* Finder view */
                            match.state === 'claimed' ? (
                              <div className="space-y-2">
                                <p className="text-[11px] text-amber-900 font-semibold">
                                  Owner claimed this item. Please verify:
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleConfirm(match._id)}
                                    className="flex-1 py-1.5 bg-sage-500 hover:bg-sage-600 text-white rounded-full text-xs font-semibold"
                                  >
                                    Confirm Return
                                  </button>
                                  <button
                                    onClick={() => handleReject(match._id)}
                                    className="flex-1 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            ) : match.state === 'confirmed' ? (
                              <span className="text-[11px] text-sage-800 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-sage-600" /> Successfully Returned
                              </span>
                            ) : (
                              <span className="text-[11px] text-ink-muted">
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
                <div className="p-4 bg-theme-subcard border-t border-theme-border flex justify-between items-center text-xs">
                  {item.state !== 'returned' ? (
                    <button
                      onClick={() => handleMarkReturned(item._id)}
                      className="text-sage-700 hover:text-sage-800 hover:underline font-semibold"
                    >
                      Mark as Returned
                    </button>
                  ) : (
                    <span className="text-ink-faint font-medium">Archived</span>
                  )}

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-500 hover:text-red-700 hover:underline font-medium flex items-center gap-1"
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
