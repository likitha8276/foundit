import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, ArrowUpRight, Compass, Search, Tag } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="border-b border-paper-border bg-paper/95 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Masthead Branding */}
          <div className="flex items-baseline gap-3">
            <Link to="/" className="group flex items-baseline gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-rust transition-colors">
                FoundIT
              </span>
              <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-ink-muted border-l border-paper-border pl-2 font-mono">
                College Lost &amp; Found
              </span>
            </Link>
          </div>

          {/* Center: Live Campus Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs text-ink-muted bg-paper-card border border-paper-border px-3 py-1 rounded-[2px]">
            <span className="inline-block w-2 h-2 rounded-full bg-rust animate-pulse" />
            <span>Campus Community Notice Board · Active</span>
          </div>

          {/* Right Navigation */}
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/upload?type=lost"
              className="text-xs sm:text-sm font-medium text-ink hover:text-rust transition-colors"
            >
              Report Lost
            </Link>
            <Link
              to="/upload?type=found"
              className="text-xs sm:text-sm font-medium text-ink hover:text-rust transition-colors"
            >
              Post Found
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-ink border border-paper-border bg-paper-card hover:border-rust hover:text-rust rounded-[2px] transition-all"
            >
              <span>User Portal</span>
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
