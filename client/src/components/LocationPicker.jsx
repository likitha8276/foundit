import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';
import { DEFAULT_MAP_CENTER } from '../api';

export default function LocationPicker({
  latitude,
  longitude,
  locationName,
  radiusMeters = 300,
  onChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const currentLat = latitude || DEFAULT_MAP_CENTER[0];
  const currentLng = longitude || DEFAULT_MAP_CENTER[1];

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 15,
        scrollWheelZoom: false
      });

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon
      const customIcon = window.L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #D9531E;
            border: 2px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const marker = window.L.marker([currentLat, currentLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      // Radius circle
      const circle = window.L.circle([currentLat, currentLng], {
        radius: radiusMeters,
        color: '#D9531E',
        fillColor: '#D9531E',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        circle.setLatLng(pos);
        onChange({
          latitude: pos.lat,
          longitude: pos.lng,
          radiusMeters
        });
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        circle.setLatLng(e.latlng);
        onChange({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          radiusMeters
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      mapInstanceRef.current.setView([currentLat, currentLng]);
      markerRef.current?.setLatLng([currentLat, currentLng]);
      circleRef.current?.setLatLng([currentLat, currentLng]);
      circleRef.current?.setRadius(radiusMeters);
    }
  }, [currentLat, currentLng, radiusMeters]);

  // Use HTML5 Geolocation API
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        setLocating(false);
        onChange({
          latitude: lat,
          longitude: lng,
          locationName: locationName || 'My current GPS location',
          radiusMeters: Math.max(100, Math.round(accuracy || 200))
        });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
        }
      },
      (err) => {
        setLocating(false);
        setGpsError(`Unable to retrieve location (${err.message}). Click on the map to pin manually.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink font-mono flex items-center gap-1.5">
          <MapPin size={14} className="text-rust" />
          Location &amp; Proximity Pin
        </label>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-rust hover:text-rust-hover bg-rust/10 hover:bg-rust/15 px-2.5 py-1 rounded-[2px] transition-colors disabled:opacity-50"
        >
          <Navigation size={13} className={locating ? 'animate-spin' : ''} />
          <span>{locating ? 'Acquiring GPS...' : 'Use my current location'}</span>
        </button>
      </div>

      {gpsError && (
        <p className="text-xs text-rust font-medium bg-rust/5 p-2 border border-rust/20 rounded-[2px]">
          {gpsError}
        </p>
      )}

      {/* Interactive Map Box */}
      <div className="relative border border-paper-border rounded-[2px] overflow-hidden bg-paper shadow-xs">
        <div
          ref={mapContainerRef}
          className="w-full h-56 sm:h-64 z-10"
          style={{ minHeight: '220px' }}
        />
        <div className="absolute bottom-2 left-2 z-20 bg-paper-card/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-mono text-ink border border-paper-border rounded-[2px] shadow-xs">
          Lat: {currentLat.toFixed(4)}, Lng: {currentLng.toFixed(4)} · Click or drag pin
        </div>
      </div>

      {/* Named Landmark / Building Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] text-ink-muted mb-1 font-mono uppercase">
            Place / Building Name
          </label>
          <input
            type="text"
            value={locationName || ''}
            onChange={(e) => onChange({ locationName: e.target.value })}
            placeholder="e.g. Metro Station Concourse, City Plaza Benches, Coffee Shop"
            className="w-full px-3 py-2 bg-paper-card border border-paper-border rounded-[2px] text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-rust"
          />
        </div>

        <div>
          <label className="block text-[11px] text-ink-muted mb-1 font-mono uppercase flex items-center justify-between">
            <span>Search / Loss Radius</span>
            <span className="font-bold text-ink">{radiusMeters} meters</span>
          </label>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={radiusMeters}
              onChange={(e) => onChange({ radiusMeters: Number(e.target.value) })}
              className="w-full accent-rust cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
