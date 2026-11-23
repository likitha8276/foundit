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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Link to="/" className="text-xs text-ink-muted hover:text-rust font-mono transition-colors">
          &larr; Back to Notice Board
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo & Details (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="notice-card p-6 relative bg-paper-card border border-paper-border rounded-[2px]">
            <div className="tape-strip" />

            <div className="flex items-center justify-between border-b border-paper-border pb-3 mb-4">
              <span className="text-xs uppercase font-mono tracking-wider text-ink-muted">
                {item.category}
              </span>
              <span className={`stamp ${item.status === 'CLAIMED' || claimed ? 'stamp-claimed' : 'stamp-found'}`}>
                {claimed ? 'CLAIMED' : item.status}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug mb-3">
              {item.name}
            </h1>

            <p className="text-sm text-ink-muted leading-relaxed mb-6">
              {item.description}
            </p>

            {item.photoUrl && (
              <div className="bg-white p-2 border border-paper-border shadow-xs mb-6">
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full h-64 sm:h-80 object-cover rounded-[1px]"
                />
                <p className="text-[11px] text-ink-faint text-center pt-2 font-mono">
                  Report photo · {item.location}
                </p>
              </div>
            )}

            {/* Metadata Table */}
            <div className="border-t border-paper-border pt-4 space-y-2.5 text-xs text-ink">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted flex items-center gap-1.5">
                  <MapPin size={13} className="text-rust" /> Reported Area:
                </span>
                <span className="font-medium">{item.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted flex items-center gap-1.5">
                  <Clock size={13} /> Reported Date:
                </span>
                <span className="font-mono">{item.timeAgo || item.date}</span>
              </div>
              {item.currentHolding && (
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted flex items-center gap-1.5">
                    <Compass size={13} /> Current Custody:
                  </span>
                  <span className="font-semibold text-rust">{item.currentHolding}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Claim Action & AI Proximity Matches (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Claim Action Box */}
          <div className="notice-card p-6 bg-paper-card border border-paper-border rounded-[2px] space-y-4">
            <h2 className="font-serif text-xl font-bold text-ink">
              Is this item yours?
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              If this item belongs to you, initiate a claim with a distinguishing detail (serial number, case engraving, or wallpaper).
            </p>

            {claimed ? (
              <div className="p-4 bg-[#2F6F4E]/10 border border-[#2F6F4E] rounded-[2px] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#2F6F4E]">
                  <CheckCircle2 size={16} />
                  <span>Claim Submitted &amp; Verified</span>
                </div>
                <p className="text-ink-muted">
                  The finder has been notified. Contact details revealed:
                </p>
                <div className="pt-1 font-mono text-xs text-ink border-t border-[#2F6F4E]/30 mt-2">
                  <p>👤 {item.contact?.finderName || 'Desk Supervisor'}</p>
                  <p>📞 {item.contact?.note || 'Call +91 98765 43210'}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClaimModal(true)}
                className="w-full py-3 px-4 bg-rust hover:bg-rust-hover active:bg-rust-hover text-white font-medium text-xs rounded-[2px] transition-colors shadow-sm text-center"
              >
                This is mine (Claim Item) &rarr;
              </button>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-ink-faint border-t border-paper-border/60 pt-3">
              <ShieldCheck size={13} className="text-[#2F6F4E]" />
              <span>Contact details are never published publicly.</span>
            </div>
          </div>

          {/* Campus Matches */}
          <div className="notice-card p-6 bg-paper-card border border-paper-border rounded-[2px] space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border pb-2.5">
              <h3 className="font-serif text-base font-bold text-ink">
                Possible Matches on Campus
              </h3>
              <span className="text-[11px] font-mono text-ink-muted">
                {matches.length} Candidates
              </span>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Items reported around campus that match this description:
            </p>

            <div className="space-y-3">
              {matches.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-paper border border-paper-border rounded-[2px] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-ink text-sm">
                      {m.item?.name || m.name}
                    </span>
                    <span className="stamp stamp-found text-[10px]">
                      {m.percentage}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-rust font-medium">
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
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-card border-2 border-rust max-w-md w-full p-6 rounded-[2px] shadow-2xl relative space-y-4">
            <h3 className="font-serif text-xl font-bold text-ink border-b border-paper-border pb-3">
              Verify Ownership of {item.name}
            </h3>

            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-ink-muted uppercase mb-1">
                  Describe a distinguishing detail *
                </label>
                <textarea
                  required
                  rows={3}
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="e.g. Serial number, scratch on back, passcode lock screen color, sticker label..."
                  className="w-full p-2.5 bg-paper border border-paper-border rounded-[2px] text-xs text-ink focus:outline-none focus:border-rust"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-paper-border">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rust hover:bg-rust-hover text-white font-medium text-xs rounded-[2px]"
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
