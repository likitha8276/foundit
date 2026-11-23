import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Tag, ArrowRight, Clock, Map, LayoutGrid, Navigation, ShieldCheck, Sparkles } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. ASYMMETRIC EDITORIAL HEADER */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-10 border-b border-paper-border">
        {/* Left Column: Heading, Core Actions & Campus Value Prop */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-ink-muted bg-paper-card border border-paper-border rounded-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-rust" />
            <span>Campus Community Notice Board · Live Feed</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
            Lost something on campus? Someone probably found it.
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-xl leading-relaxed">
            Report lost or found belongings across academic blocks, library, food courts, and hostels. If a match is found nearby, we connect you safely.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/upload?type=lost"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-rust hover:bg-rust-hover active:bg-rust-hover text-white font-medium text-sm rounded-[2px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rust focus:ring-offset-2 focus:ring-offset-paper"
            >
              <span>I lost something</span>
              <ArrowRight size={15} strokeWidth={2} />
            </Link>

            <Link
              to="/upload?type=found"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-paper-card hover:bg-white text-ink font-medium text-sm border border-paper-darkBorder rounded-[2px] transition-all hover:border-ink shadow-sm"
            >
              <span>I found something</span>
              <Tag size={15} strokeWidth={1.5} />
            </Link>

            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
              className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-mono text-ink-muted hover:text-ink border border-paper-border hover:border-ink rounded-[2px] transition-colors"
            >
              <Map size={14} className="text-rust" />
              <span>{viewMode === 'map' ? 'Switch to Card Feed' : 'Explore on Map'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Pinned Live Dispatch & Tally */}
        <div className="lg:col-span-5 relative">
          <div
            className="notice-card p-6 relative bg-paper-card border border-paper-border rounded-[2px]"
            style={{ transform: 'rotate(-1.2deg)' }}
          >
            <div className="tape-strip" />

            <div className="flex items-baseline justify-between border-b border-paper-border pb-3 mb-4">
              <span className="text-xs uppercase font-mono tracking-wider text-ink-muted">
                Campus Dispatch
              </span>
              <span className="text-[11px] text-ink-faint">
                Updated Today
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-serif text-5xl font-bold text-ink tracking-tight">
                14
              </span>
              <span className="text-sm font-medium text-ink leading-snug">
                items waiting to be claimed on campus this week
              </span>
            </div>

            <div className="space-y-2 mt-4 text-xs text-ink-muted border-t border-paper-border/60 pt-3">
              <div className="flex items-center justify-between">
                <span>• Items returned to owners this month</span>
                <span className="font-mono text-ink font-semibold">38 items</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Handed in to Security / Dept desks</span>
                <span className="font-mono text-ink font-semibold">6 items</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Common items: Calculators, IDs, Earbuds</span>
                <span className="font-mono text-ink font-semibold">Active</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-paper-border flex items-center justify-between text-[11px] text-ink-muted">
              <span className="flex items-center gap-1 text-[#2F6F4E] font-medium">
                <ShieldCheck size={13} />
                Private contact exchange
              </span>
              <span className="font-mono">Open Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH, CATEGORY & VIEW CONTROLS */}
      <section className="py-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, item, or place (e.g. Casio, AirPods, library)..."
              className="w-full pl-9 pr-4 py-2 bg-paper-card border border-paper-border rounded-[2px] text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-rust transition-colors"
            />
          </div>

          {/* Controls: Category + View Toggle */}
          <div className="flex items-center gap-3">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-paper-card border border-paper-border rounded-[2px] text-xs text-ink focus:outline-none focus:border-rust"
            >
              {MOCK_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Toggle View Mode */}
            <div className="inline-flex border border-paper-border rounded-[2px] overflow-hidden bg-paper-card p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-[2px] transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-ink text-white'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-[2px] transition-colors ${
                  viewMode === 'map'
                    ? 'bg-ink text-white'
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
      <section className="pt-2">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-ink">
            {viewMode === 'map' ? 'Interactive Proximity Map' : 'Recent Items Feed'}
          </h2>
          <span className="text-xs text-ink-muted font-mono">
            {items.length} {items.length === 1 ? 'record' : 'records'} mapped
          </span>
        </div>

        {viewMode === 'map' ? (
          <div className="space-y-4">
            <p className="text-xs text-ink-muted font-mono">
              📍 Click any marker on the map to view item photos, status, and claim instructions.
            </p>
            <ItemsMap items={items} />
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-ink-muted font-mono bg-paper-card border border-paper-border rounded-[2px]">
            Checking campus notice records...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-paper-card border border-paper-border rounded-[2px] space-y-3">
            <p className="font-serif text-xl text-ink">
              Nothing here yet.
            </p>
            <p className="text-sm text-ink-muted max-w-md mx-auto">
              Either everyone is very careful, or nobody has posted in this area. If you found something, please pin it to the board.
            </p>
            <div className="pt-2">
              <Link
                to="/upload?type=found"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rust hover:underline"
              >
                <span>Post a found item</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {items.map((item) => (
              <article
                key={item.id}
                className="notice-card p-5 relative flex flex-col justify-between group"
                style={{ transform: `rotate(${item.rotation || '0deg'})` }}
              >
                {item.hasPin && (
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 pin-dot" />
                )}
                {item.hasTape && (
                  <div className="tape-strip" />
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 pt-2 mb-3">
                    <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                      {item.category}
                    </span>

                    <span
                      className={`stamp ${
                        item.status === 'CLAIMED' ? 'stamp-claimed' : 'stamp-found'
                      }`}
                      style={{ transform: 'rotate(-2deg)' }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-ink leading-snug mb-2 group-hover:text-rust transition-colors">
                    <Link to={`/item/${item.id}`}>
                      {item.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-3 mb-4">
                    {item.description}
                  </p>

                  {item.hasPhoto && item.photoUrl && (
                    <div className="mb-4 bg-white p-2 border border-paper-border shadow-xs">
                      <div className="aspect-4/3 w-full bg-paper overflow-hidden">
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-200"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-[10px] text-ink-faint text-center pt-1.5 font-mono">
                        {item.location}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-paper-border pt-3 mt-2 space-y-2 text-xs">
                  <div className="flex items-start gap-1.5 text-ink">
                    <MapPin size={13} strokeWidth={1.5} className="mt-0.5 text-rust shrink-0" />
                    <span className="font-medium text-[11px]">
                      {item.location}
                    </span>
                  </div>

                  {item.currentHolding && (
                    <div className="text-[11px] text-ink-muted bg-paper/60 px-2 py-1 border border-paper-border/60 rounded-[2px]">
                      <span className="font-semibold text-ink">Holding point: </span>
                      {item.currentHolding}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-ink-muted">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={11} strokeWidth={1.5} />
                      {item.timeAgo}
                    </span>

                    <Link
                      to={`/item/${item.id}`}
                      className="font-medium text-rust hover:text-rust-hover flex items-center gap-1"
                    >
                      <span>Claim info</span>
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
