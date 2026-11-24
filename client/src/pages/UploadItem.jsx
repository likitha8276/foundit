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
      {/* Clean Modern Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-theme-border shadow-soft mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-sage-800 bg-sage-50 border border-sage-200 rounded-full mb-3">
          <span>Notice Dispatch · New Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          {status === 'lost' ? 'Report a Lost Item' : 'Post a Found Item'}
        </h1>
        <div className="green-bar mt-2" />
        <p className="text-sm text-ink-muted mt-2.5">
          {status === 'lost'
            ? "Submit details of your lost belonging. Our matching engine will cross-reference candidate posts nearby."
            : 'Post details of the item you found so the verified owner can initiate a secure claim.'}
        </p>

        {/* Status Toggle */}
        <div className="mt-6 inline-flex p-1 bg-theme-bg border border-theme-border rounded-full">
          <button
            type="button"
            onClick={() => setStatus('lost')}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all ${
              status === 'lost'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            I Lost This
          </button>
          <button
            type="button"
            onClick={() => setStatus('found')}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all ${
              status === 'found'
                ? 'bg-sage-500 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            I Found This
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-theme-border shadow-soft space-y-6">
        {/* Item Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Casio fx-991EX, Blue Milton Bottle, AirPods Pro"
              className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-sage-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-sm text-ink focus:outline-none focus:border-sage-500 cursor-pointer"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Date {status === 'lost' ? 'Lost' : 'Found'} *
          </label>
          <input
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-sm text-ink focus:outline-none focus:border-sage-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Detailed Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mention brand, color, distinguishing scratches, stickers, case type, or unique marks..."
            className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-sage-500 focus:bg-white leading-relaxed transition-all"
          />
        </div>

        {/* Geolocation & Interactive Map Picker */}
        <div className="p-4 sm:p-5 bg-theme-subcard border border-theme-border rounded-2xl">
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
          <div className="p-5 bg-theme-subcard border border-theme-border rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-ink">
              Where is this item currently held?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {['With me', 'Security Desk', 'Facility Intake Office'].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setCurrentHolding(opt)}
                  className={`p-3 border text-center rounded-xl font-medium transition-all ${
                    currentHolding === opt
                      ? 'border-sage-600 bg-sage-500 text-white shadow-xs'
                      : 'border-theme-border bg-white text-ink-muted hover:text-ink hover:border-sage-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-ink-muted mb-1.5 uppercase">
                  Finder Name
                </label>
                <input
                  type="text"
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  placeholder="Your name or desk supervisor"
                  className="w-full px-4 py-2 bg-white border border-theme-border rounded-xl text-xs text-ink focus:outline-none focus:border-sage-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-muted mb-1.5 uppercase">
                  Finder Phone (Revealed only to verified owner)
                </label>
                <input
                  type="tel"
                  value={finderPhone}
                  onChange={(e) => setFinderPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2 bg-white border border-theme-border rounded-xl text-xs text-ink focus:outline-none focus:border-sage-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Item Photograph (Recommended)
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2.5 px-5 py-3 bg-theme-bg hover:bg-sage-50 border border-theme-border hover:border-sage-300 rounded-xl text-xs font-semibold text-sage-800 transition-all shadow-xs">
              <UploadCloud size={17} className="text-sage-600" />
              <span>Choose Photo File (JPEG/PNG, max 5MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="bg-white p-2 border border-theme-border rounded-xl shadow-xs max-w-xs">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="h-28 w-auto object-cover rounded-lg"
                />
                <p className="text-[10px] text-ink-muted text-center pt-1.5 font-medium">
                  Photo Attached
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-5 border-t border-theme-border flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-semibold text-ink-muted hover:text-sage-600 transition-colors"
          >
            &larr; Return to Browse
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-sm rounded-full transition-all shadow-sm hover:shadow-soft disabled:opacity-50"
          >
            <span>{loading ? 'Evaluating AI & Proximity Match...' : 'Publish Notice'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>

      {/* INSTANT PROXIMITY & AI MATCH BANNER / MODAL */}
      {instantMatch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sage-300 max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-lift relative space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-700 flex items-center gap-1.5">
                <Sparkles size={15} className="text-sage-500" />
                Potential Match Found Nearby!
              </span>
              <span className="badge-found">
                {instantMatch.percentage}% Match
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-ink">
                {instantMatch.name}
              </h3>
              <p className="text-xs text-ink-muted mt-1 font-medium">
                📍 {instantMatch.location} · {instantMatch.distanceMeters}m from your report
              </p>
            </div>

            <div className="p-4 bg-theme-subcard border border-theme-border text-xs text-ink-muted rounded-2xl space-y-1">
              <p className="font-semibold text-ink">Ownership Verification Prompt:</p>
              <p>
                Does your item match the description and location above? You can review the match details and initiate a private claim.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-xs text-ink-muted hover:text-ink font-semibold rounded-full"
              >
                Dismiss to Board
              </button>
              <Link
                to="/item/item-001"
                className="px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs rounded-full transition-all shadow-xs"
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
