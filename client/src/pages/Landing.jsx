import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Tag, ArrowRight, Clock, Map, LayoutGrid, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { getItems, MOCK_CATEGORIES } from '../api';
import ItemsMap from '../components/ItemsMap';

export default function Landing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getItems({
        category: selectedCategory,
        query: searchQuery,
        lat: userCoords?.lat,
        lng: userCoords?.lng
      });
      setItems(data);
      setLoading(false);
    }
    loadData();
  }, [selectedCategory, searchQuery, userCoords]);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. CLEAN MODERN HERO SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-theme-border shadow-soft">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-sage-800 bg-sage-50 border border-sage-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
              <span>Community Lost &amp; Found Portal</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
                Lost something? Someone probably found it.
              </h1>
              {/* Green Underline Accent Bar (matching reference theme) */}
              <div className="green-bar mt-3" />
            </div>

            <p className="text-base text-ink-muted max-w-xl leading-relaxed">
              A modern, privacy-focused community board to report and claim lost belongings. Connected with multimodal AI matching and GPS proximity.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/upload?type=lost"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-sm rounded-full transition-all shadow-sm hover:shadow-soft"
              >
                <span>I Lost Something</span>
                <ArrowRight size={15} strokeWidth={2} />
              </Link>

              <Link
                to="/upload?type=found"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-sage-50 text-sage-800 font-semibold text-sm border border-sage-300 rounded-full transition-all shadow-xs"
              >
                <span>I Found Something</span>
                <Tag size={15} strokeWidth={2} />
              </Link>

              <button
                onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-ink-muted hover:text-sage-700 bg-theme-subcard hover:bg-sage-100 border border-theme-border rounded-full transition-colors"
              >
                <Map size={15} className="text-sage-600" />
                <span>{viewMode === 'map' ? 'Switch to Card Feed' : 'Explore on Map'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean Stat Card (matching reference screenshot style) */}
          <div className="lg:col-span-5">
            <div className="bg-theme-subcard border border-theme-border rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-theme-border/80 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-800 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-sage-600" />
                  Live Dispatch Summary
                </span>
                <span className="text-[11px] font-semibold text-sage-700 bg-white px-2.5 py-0.5 rounded-full border border-theme-border">
                  Today
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold text-ink tracking-tight">
                  14
                </span>
                <span className="text-sm font-medium text-ink-muted leading-tight">
                  active items waiting to be claimed in this area
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-ink-muted border-t border-theme-border/60">
                <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-theme-border">
                  <span className="font-medium text-ink">Returned to owners this month</span>
                  <span className="font-bold text-sage-700">38 items</span>
                </div>
                <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-theme-border">
                  <span className="font-medium text-ink">Handed to verified collection desks</span>
                  <span className="font-bold text-sage-700">6 items</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-sage-800">
                <span className="flex items-center gap-1.5 font-semibold text-sage-700">
                  <ShieldCheck size={14} className="text-sage-600" />
                  Private contact exchange
                </span>
                <span className="text-[11px] font-medium text-ink-faint">Verified Protection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH, CATEGORY & VIEW CONTROLS */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-theme-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" size={16} strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, item, or place (e.g. Casio, AirPods, Metro)..."
              className="w-full pl-10 pr-4 py-2.5 bg-theme-bg border border-theme-border rounded-full text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-sage-500 focus:bg-white transition-all"
            />
          </div>

          {/* Controls: Category + View Toggle */}
          <div className="flex items-center gap-3">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-theme-bg border border-theme-border rounded-full text-xs font-medium text-ink focus:outline-none focus:border-sage-500 cursor-pointer"
            >
              {MOCK_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Toggle View Mode */}
            <div className="inline-flex border border-theme-border rounded-full overflow-hidden bg-theme-bg p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-sage-500 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  viewMode === 'map'
                    ? 'bg-sage-500 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Map size={13} />
                <span>Map Explorer</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONDITIONAL RENDER: MAP EXPLORER OR CARD FEED */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink">
              {viewMode === 'map' ? 'Interactive Proximity Map' : 'Recent Community Notices'}
            </h2>
            <div className="green-bar mt-1.5" />
          </div>
          <span className="text-xs font-semibold text-sage-800 bg-sage-50 border border-sage-200 px-3 py-1 rounded-full">
            {items.length} {items.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>

        {viewMode === 'map' ? (
          <div className="bg-white rounded-3xl p-5 border border-theme-border shadow-soft space-y-4">
            <p className="text-xs font-medium text-ink-muted">
              📍 Click any marker on the map to inspect photos, distance perimeters, and ownership verification.
            </p>
            <ItemsMap items={items} />
          </div>
        ) : loading ? (
          <div className="p-16 text-center text-sm font-medium text-ink-muted bg-white border border-theme-border rounded-3xl shadow-soft">
            <div className="w-8 h-8 border-3 border-sage-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading community notice records...
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white border border-theme-border rounded-3xl shadow-soft space-y-3">
            <p className="text-xl font-bold text-ink">
              No matching records found.
            </p>
            <p className="text-sm text-ink-muted max-w-md mx-auto">
              No items match this filter yet. If you found something in this area, please post a notice to help return it.
            </p>
            <div className="pt-2">
              <Link
                to="/upload?type=found"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs rounded-full transition-all shadow-xs"
              >
                <span>Post a found item</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {items.map((item) => (
              <article
                key={item.id}
                className="pro-card p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-sage-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>

                    <span
                      className={
                        item.status === 'CLAIMED'
                          ? 'badge-claimed'
                          : item.status === 'LOST'
                          ? 'badge-lost'
                          : 'badge-found'
                      }
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-ink leading-snug group-hover:text-sage-600 transition-colors">
                    <Link to={`/item/${item.id}`}>
                      {item.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {item.hasPhoto && item.photoUrl && (
                    <div className="rounded-xl overflow-hidden border border-theme-border bg-theme-bg">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-theme-border/80 pt-3.5 mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-ink font-medium">
                    <MapPin size={13} className="text-sage-600 shrink-0" />
                    <span className="truncate">
                      {item.location}
                    </span>
                  </div>

                  {item.currentHolding && (
                    <div className="text-[11px] text-sage-900 bg-sage-50 px-2.5 py-1 border border-sage-200 rounded-lg flex items-center justify-between">
                      <span className="text-ink-muted">Custody:</span>
                      <span className="font-semibold">{item.currentHolding}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-ink-faint" />
                      {item.timeAgo}
                    </span>

                    <Link
                      to={`/item/${item.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-sage-600 hover:text-sage-700 hover:underline"
                    >
                      <span>Claim Details</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
