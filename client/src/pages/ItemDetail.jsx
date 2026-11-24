import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItemById, getItemMatches, DEFAULT_MAP_CENTER } from '../api';
import { MapPin, Clock, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Phone, User, Compass } from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [claimed, setClaimed] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimProof, setClaimProof] = useState('');

  useEffect(() => {
    async function loadItem() {
      const data = await getItemById(id);
      setItem(data);
      const m = await getItemMatches(id);
      setMatches(m);
    }
    loadItem();
  }, [id]);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs font-mono text-ink-muted">
        Loading notice record...
      </div>
    );
  }

  const handleClaim = (e) => {
    e.preventDefault();
    setClaimed(true);
    setShowClaimModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Breadcrumb Navigation */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-sage-600 transition-colors">
          &larr; Back to Notice Feed
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo & Details (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-theme-border shadow-soft">
            <div className="flex items-center justify-between border-b border-theme-border pb-4 mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-800 bg-sage-50 border border-sage-200 px-3 py-1 rounded-full">
                {item.category}
              </span>
              <span className={claimed ? 'badge-claimed' : item.status === 'CLAIMED' ? 'badge-claimed' : item.status === 'LOST' ? 'badge-lost' : 'badge-found'}>
                {claimed ? 'CLAIMED' : item.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-snug">
              {item.name}
            </h1>
            <div className="green-bar mt-2 mb-4" />

            <p className="text-sm text-ink-muted leading-relaxed mb-6">
              {item.description}
            </p>

            {item.photoUrl && (
              <div className="rounded-2xl border border-theme-border overflow-hidden bg-theme-bg mb-6">
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full h-64 sm:h-80 object-cover"
                />
                <p className="text-xs text-ink-muted text-center py-2 bg-theme-subcard border-t border-theme-border font-medium">
                  Notice Photo · {item.location}
                </p>
              </div>
            )}

            {/* Metadata Table */}
            <div className="border-t border-theme-border pt-4 space-y-3 text-xs text-ink">
              <div className="flex items-center justify-between bg-theme-subcard px-4 py-2.5 rounded-xl border border-theme-border">
                <span className="text-ink-muted flex items-center gap-1.5 font-medium">
                  <MapPin size={14} className="text-sage-600" /> Reported Area:
                </span>
                <span className="font-semibold text-ink">{item.location}</span>
              </div>
              <div className="flex items-center justify-between bg-theme-subcard px-4 py-2.5 rounded-xl border border-theme-border">
                <span className="text-ink-muted flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-sage-600" /> Reported Date:
                </span>
                <span className="font-semibold text-ink">{item.timeAgo || item.date}</span>
              </div>
              {item.currentHolding && (
                <div className="flex items-center justify-between bg-sage-50 px-4 py-2.5 rounded-xl border border-sage-200">
                  <span className="text-sage-800 flex items-center gap-1.5 font-medium">
                    <Compass size={14} className="text-sage-600" /> Current Custody:
                  </span>
                  <span className="font-bold text-sage-800">{item.currentHolding}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Claim Action & AI Proximity Matches (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Claim Action Box */}
          <div className="bg-theme-subcard border border-theme-border rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-ink">
                Is this item yours?
              </h2>
              <div className="green-bar mt-1.5" />
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              If this item belongs to you, initiate a claim with a distinguishing detail (serial number, case engraving, or wallpaper).
            </p>

            {claimed ? (
              <div className="p-4 bg-sage-100 border border-sage-300 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sage-800">
                  <CheckCircle2 size={16} className="text-sage-600" />
                  <span>Claim Submitted &amp; Verified</span>
                </div>
                <p className="text-ink-muted">
                  The finder has been notified. Contact details revealed:
                </p>
                <div className="pt-2 text-xs font-semibold text-ink border-t border-sage-200 space-y-1">
                  <p>👤 {item.contact?.finderName || 'Desk Supervisor'}</p>
                  <p>📞 {item.contact?.note || 'Call +91 98765 43210'}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClaimModal(true)}
                className="w-full py-3 px-4 bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white font-semibold text-xs rounded-full transition-all shadow-sm hover:shadow-soft text-center"
              >
                This is mine (Claim Item) &rarr;
              </button>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-ink-muted border-t border-theme-border pt-3">
              <ShieldCheck size={14} className="text-sage-600" />
              <span>Contact details are never published publicly.</span>
            </div>
          </div>

          {/* Possible Matches */}
          <div className="bg-white border border-theme-border rounded-3xl p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Possible Matches Nearby
                </h3>
                <div className="green-bar mt-1" />
              </div>
              <span className="text-[11px] font-semibold text-sage-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
                {matches.length} Candidates
              </span>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Items reported in this vicinity matching this description:
            </p>

            <div className="space-y-3">
              {matches.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-theme-subcard border border-theme-border rounded-2xl text-xs space-y-2 hover:border-sage-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">
                      {m.item?.name || m.name}
                    </span>
                    <span className="badge-found text-[10px]">
                      {m.percentage}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-sage-700 font-semibold flex items-center gap-1">
                    📍 {m.proximityText || `${m.distanceMeters || 120}m away`}
                  </p>

                  <p className="text-[11px] text-ink-muted leading-snug">
                    {m.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-theme-border max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-soft relative space-y-4">
            <div>
              <h3 className="text-xl font-bold text-ink">
                Verify Ownership of {item.name}
              </h3>
              <div className="green-bar mt-2" />
            </div>

            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Describe a distinguishing detail *
                </label>
                <textarea
                  required
                  rows={3}
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="e.g. Serial number, scratch on back, lock screen wallpaper, sticker label..."
                  className="w-full p-3 bg-theme-bg border border-theme-border rounded-xl text-xs text-ink focus:outline-none focus:border-sage-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs rounded-full transition-all shadow-xs"
                >
                  Confirm Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
