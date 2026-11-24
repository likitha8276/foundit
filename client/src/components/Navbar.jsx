import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="border-b border-theme-border bg-white/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sage-500 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                🌱
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-ink group-hover:text-sage-600 transition-colors">
                  FoundIT
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-sage-600 -mt-1 font-mono">
                  Community Notice Board
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Live Board Status */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-sage-800 bg-sage-50 border border-sage-200 px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <span>Community Board · Live Feed Active</span>
          </div>

          {/* Right Navigation */}
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className={`text-xs sm:text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-sage-700 font-semibold' : 'text-ink-muted hover:text-sage-600'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/upload?type=lost"
              className={`text-xs sm:text-sm font-medium transition-colors ${
                location.search.includes('type=lost') ? 'text-sage-700 font-semibold' : 'text-ink-muted hover:text-sage-600'
              }`}
            >
              Report Lost
            </Link>
            <Link
              to="/upload?type=found"
              className={`text-xs sm:text-sm font-medium transition-colors ${
                location.search.includes('type=found') ? 'text-sage-700 font-semibold' : 'text-ink-muted hover:text-sage-600'
              }`}
            >
              Post Found
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sage-500 hover:bg-sage-600 active:bg-sage-700 rounded-full shadow-xs transition-all hover:shadow-soft"
            >
              <span>User Portal</span>
              <ArrowUpRight size={14} strokeWidth={2} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
