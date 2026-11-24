import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Layers, Filter } from 'lucide-react';
import { DEFAULT_MAP_CENTER } from '../api';

export default function ItemsMap({ items = [], onItemSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'FOUND' | 'LOST'

  const filteredItems = items.filter(it => {
    if (activeFilter === 'ALL') return true;
    return (it.status || 'FOUND').toUpperCase() === activeFilter;
  });

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: DEFAULT_MAP_CENTER,
        zoom: 15,
        scrollWheelZoom: true
      });

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = window.L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    filteredItems.forEach(item => {
      const lat = item.lat || item.location?.coordinates?.[1] || DEFAULT_MAP_CENTER[0];
      const lng = item.lng || item.location?.coordinates?.[0] || DEFAULT_MAP_CENTER[1];
      const isLost = (item.status || '').toLowerCase() === 'lost';
      const pinColor = isLost ? '#D84315' : '#4CA869';

      const pinIcon = window.L.divIcon({
        className: 'item-map-pin',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            background: ${pinColor};
            border: 2px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 8px rgba(45,95,55,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 7px; height: 7px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 26]
      });

      const marker = window.L.marker([lat, lng], { icon: pinIcon });

      // Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-ink';
      popupContent.innerHTML = `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 210px;">
          ${item.photoUrl ? `<img src="${item.photoUrl}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 12px; margin-bottom: 8px; border: 1px solid #D8EAD9;" />` : ''}
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; letter-spacing: 0.05em;">
            ${item.status || 'FOUND'} · ${item.category}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #1C2B21; margin-top: 2px; line-height: 1.2;">
            ${item.name}
          </div>
          <div style="font-size: 11px; color: #526A59; margin-top: 4px;">
            📍 ${item.location || 'Reported Location'}
          </div>
          <div style="margin-top: 8px; border-top: 1px solid #D8EAD9; padding-top: 6px;">
            <a href="/item/${item.id}" style="color: #4CA869; font-size: 11px; font-weight: 700; text-decoration: none;">
              View Details &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });

  }, [filteredItems]);

  return (
    <div className="relative border border-theme-border rounded-3xl overflow-hidden bg-white shadow-soft">
      {/* Top Filter Bar */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md border border-theme-border px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2">
        <Filter size={13} className="text-sage-700" />
        <span className="text-[11px] font-semibold text-ink-muted uppercase">Filter:</span>
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
            activeFilter === 'ALL' ? 'bg-sage-500 text-white shadow-xs' : 'text-ink-muted hover:text-ink'
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setActiveFilter('FOUND')}
          className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
            activeFilter === 'FOUND' ? 'bg-sage-500 text-white shadow-xs' : 'text-ink-muted hover:text-ink'
          }`}
        >
          Found
        </button>
        <button
          onClick={() => setActiveFilter('LOST')}
          className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
            activeFilter === 'LOST' ? 'bg-amber-600 text-white shadow-xs' : 'text-ink-muted hover:text-ink'
          }`}
        >
          Lost
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-96 sm:h-[460px] z-10"
        style={{ minHeight: '380px' }}
      />

      <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-theme-border px-4 py-2 rounded-full shadow-xs text-xs font-semibold text-ink flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-500" /> Found
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Lost
        </span>
      </div>
    </div>
  );
}
