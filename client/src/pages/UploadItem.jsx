import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportLost, reportFound, DEFAULT_MAP_CENTER } from '../api';
import LocationPicker from '../components/LocationPicker';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Calendar,
  Tag,
  FileText,
  Phone,
  User,
  ArrowRight,
  ShieldAlert,
  Compass,
  Sparkles,
  MapPin
} from 'lucide-react';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics & Audio' },
  { value: 'bottles', label: 'Water Bottles & Tumblers' },
  { value: 'documents', label: 'ID Cards & Documents' },
  { value: 'keys', label: 'Keys & Keychains' },
  { value: 'accessories', label: 'Watches & Accessories' },
  { value: 'bags', label: 'Bags & Backpacks' },
  { value: 'clothing', label: 'Clothing & Jackets' },
  { value: 'wallet', label: 'Wallets & Purses' },
  { value: 'other', label: 'Other Items' }
];

export default function UploadItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialStatus = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [name, setName] = useState('');
  const [category, setCategory] = useState('electronics');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus); // 'lost' | 'found'
  
  // Geolocation state
  const [latitude, setLatitude] = useState(DEFAULT_MAP_CENTER[0]);
  const [longitude, setLongitude] = useState(DEFAULT_MAP_CENTER[1]);
  const [locationName, setLocationName] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(300);

  // Holding & Contact details (for found items)
  const [currentHolding, setCurrentHolding] = useState('With me');
  const [finderName, setFinderName] = useState(user?.name || '');
  const [finderPhone, setFinderPhone] = useState(user?.phone || '');

  // Photo state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [instantMatch, setInstantMatch] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5 MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleLocationChange = (data) => {
    if (data.latitude !== undefined) setLatitude(data.latitude);
    if (data.longitude !== undefined) setLongitude(data.longitude);
    if (data.locationName !== undefined) setLocationName(data.locationName);
    if (data.radiusMeters !== undefined) setRadiusMeters(data.radiusMeters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an item name');
      return;
    }
    if (description.trim().length < 8) {
      setError('Please provide a slightly more descriptive summary (at least 8 characters)');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      category,
      date,
      description,
      latitude,
      longitude,
      locationName: locationName || 'Reported Location',
      radiusMeters,
      currentHolding,
      finderName,
      finderPhone,
      image: imageFile
    };

    try {
      let result;
      if (status === 'lost') {
        result = await reportLost(payload);
      } else {
        result = await reportFound(payload);
      }

      setLoading(false);

      if (result.hasMatch && result.match) {
        setInstantMatch(result.match);
      } else {
        navigate('/');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error pinning item to board. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Editorial Header */}
      <div className="border-b border-paper-border pb-6 mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-ink-muted bg-paper-card border border-paper-border rounded-[2px] mb-3">
          <span>Notice Dispatch · New Report</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
          {status === 'lost' ? 'Report a Lost Item' : 'Pin a Found Item'}
        </h1>
        <p className="text-sm text-ink-muted mt-2">
          {status === 'lost'
            ? "Pin your lost item on the campus board. We'll notify you if someone posts a matching item."
            : 'Post details of the item you found on campus. The owner can verify and arrange a pickup.'}
        </p>

        {/* Status Toggle */}
        <div className="mt-5 inline-flex p-1 bg-paper-card border border-paper-border rounded-[2px]">
          <button
            type="button"
            onClick={() => setStatus('lost')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-[2px] transition-colors ${
              status === 'lost'
                ? 'bg-rust text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            I Lost This
          </button>
          <button
            type="button"
            onClick={() => setStatus('found')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-[2px] transition-colors ${
              status === 'found'
                ? 'bg-[#2F6F4E] text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            I Found This
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rust/10 border border-rust text-rust text-xs rounded-[2px] flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-ink mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Casio fx-991EX, Blue Milton Bottle, AirPods Pro"
              className="w-full px-3 py-2 bg-paper-card border border-paper-border rounded-[2px] text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-rust"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-ink mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-paper-card border border-paper-border rounded-[2px] text-sm text-ink focus:outline-none focus:border-rust"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold uppercase font-mono text-ink mb-1">
            Date {status === 'lost' ? 'Lost' : 'Found'} *
          </label>
          <input
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-paper-card border border-paper-border rounded-[2px] text-sm text-ink focus:outline-none focus:border-rust"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase font-mono text-ink mb-1">
            Detailed Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mention brand, color, scratches, stickers, case type, or specific distinguishing marks..."
            className="w-full px-3 py-2 bg-paper-card border border-paper-border rounded-[2px] text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-rust leading-relaxed"
          />
        </div>

        {/* Geolocation & Interactive Map Picker */}
        <div className="p-4 bg-paper-card border border-paper-border rounded-[2px]">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            locationName={locationName}
            radiusMeters={radiusMeters}
            onChange={handleLocationChange}
          />
        </div>

        {/* If Found: Holding point & Contact */}
        {status === 'found' && (
          <div className="p-4 bg-paper-card border border-paper-border rounded-[2px] space-y-4">
            <h3 className="font-serif text-sm font-bold text-ink">
              Where is this item currently held?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {['With me', 'Security Desk', 'Block / Facility Office'].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setCurrentHolding(opt)}
                  className={`p-2.5 border text-center rounded-[2px] font-medium transition-colors ${
                    currentHolding === opt
                      ? 'border-ink bg-ink text-white'
                      : 'border-paper-border bg-paper text-ink-muted hover:text-ink'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-ink-muted mb-1 uppercase">
                  Finder Name
                </label>
                <input
                  type="text"
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  placeholder="Your name or desk officer"
                  className="w-full px-3 py-2 bg-paper border border-paper-border rounded-[2px] text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-ink-muted mb-1 uppercase">
                  Finder Phone (Revealed only to verified owner)
                </label>
                <input
                  type="tel"
                  value={finderPhone}
                  onChange={(e) => setFinderPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 bg-paper border border-paper-border rounded-[2px] text-xs text-ink"
                />
              </div>
            </div>
          </div>
        )}

        {/* Photo Upload (Polaroid Preview) */}
        <div>
          <label className="block text-xs font-semibold uppercase font-mono text-ink mb-1">
            Item Photograph (Optional for Lost, Strongly Recommended for Found)
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-paper-card border border-paper-darkBorder hover:border-ink rounded-[2px] text-xs font-medium text-ink transition-all">
              <UploadCloud size={16} className="text-rust" />
              <span>Choose photo file (JPEG/PNG, max 5MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="bg-white p-2 border border-paper-border shadow-xs max-w-xs">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="h-28 w-auto object-cover rounded-[1px]"
                />
                <p className="text-[10px] text-ink-muted text-center pt-1 font-mono">
                  Attached photo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-paper-border flex items-center justify-between">
          <Link
            to="/"
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            &larr; Cancel and return to board
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-rust hover:bg-rust-hover text-white font-medium text-sm rounded-[2px] transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{loading ? 'Comparing descriptions and proximity...' : 'Pin to Notice Board'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>

      {/* INSTANT PROXIMITY & AI MATCH BANNER / MODAL */}
      {instantMatch && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-card border-2 border-rust max-w-md w-full p-6 rounded-[2px] shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-rust font-bold flex items-center gap-1.5">
                <Sparkles size={14} />
                Potential Match Found Nearby!
              </span>
              <span className="stamp stamp-found">
                {instantMatch.percentage}% Match
              </span>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-ink">
                {instantMatch.name}
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                📍 {instantMatch.location} · {instantMatch.distanceMeters}m away from your report
              </p>
            </div>

            <div className="p-3 bg-paper border border-paper-border text-xs text-ink-muted rounded-[2px] space-y-1">
              <p className="font-semibold text-ink">Ownership Verification Prompt:</p>
              <p>
                Does your item match the description and location above? You can review the match details and initiate a private claim.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink font-medium"
              >
                Dismiss to Board
              </button>
              <Link
                to="/item/item-001"
                className="px-4 py-2 bg-rust hover:bg-rust-hover text-white font-medium text-xs rounded-[2px] transition-colors"
              >
                Review Match &amp; Claim &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
