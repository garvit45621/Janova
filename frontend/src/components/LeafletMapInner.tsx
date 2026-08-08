'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint } from '../types';

interface LeafletMapInnerProps {
  complaints: Complaint[];
  selectedX: number;
  selectedY: number;
  onMapClick: (x: number, y: number, addressName?: string) => void;
}

export default function LeafletMapInner({ complaints, selectedX, selectedY, onMapClick }: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);

  // Setup Leaflet icon fallback fixes
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const detectUserLocation = (map: L.Map) => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!map || !(map as any)._container || !mapContainerRef.current) return;

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;

          const initialLat = 12.9716;
          const initialLng = 77.5946;

          try {
            map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
          } catch (e) {
            try {
              map.setView([lat, lng], 15);
            } catch (err) {}
          }

          // Render pulsating accuracy circle
          if (userLocationCircleRef.current) {
            userLocationCircleRef.current.setLatLng([lat, lng]);
          } else {
            userLocationCircleRef.current = L.circle([lat, lng], {
              radius: Math.min(position.coords.accuracy || 150, 300),
              color: '#38bdf8',
              fillColor: '#38bdf8',
              fillOpacity: 0.18,
              weight: 2
            }).addTo(map);
          }

          // Convert coordinates to relative integer coordinates
          const x = Math.round((lat - initialLat) * 10000 + 250);
          const y = Math.round((lng - initialLng) * 10000 + 150);

          let addressName = `Detected GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

          // Reverse Geocode address lookup via OpenStreetMap Nominatim
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.display_name) {
                const parts = data.display_name.split(',');
                addressName = parts.slice(0, 3).join(',').trim();
              }
            }
          } catch (e) {
            console.log('Reverse geocoding fallback used');
          }

          onMapClick(x, y, addressName);

          // Place target marker
          if (clickMarkerRef.current) {
            clickMarkerRef.current.setLatLng([lat, lng]);
          } else {
            clickMarkerRef.current = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #06B6D4; width: 16px; height: 16px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 14px #06B6D4;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })
            }).addTo(map);
          }
        },
        (err) => {
          console.warn('Geolocation permission/error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map centered on city center default
    const initialLat = 12.9716;
    const initialLng = 77.5946;
    
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    });

    const primaryTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const fallbackTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(primaryTileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    tileLayer.on('tileerror', () => {
      tileLayer.setUrl(fallbackTileUrl);
    });

    const markerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markerGroupRef.current = markerGroup;

    setTimeout(() => {
      if (map && (map as any)._container) {
        try {
          map.invalidateSize();
        } catch (e) {}
      }
    }, 150);

    // Auto-detect user's GPS location on load
    detectUserLocation(map);

    // Register Click Listener
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const x = Math.round((lat - initialLat) * 10000 + 250);
      const y = Math.round((lng - initialLng) * 10000 + 150);
      
      let addressName = `Location: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            addressName = parts.slice(0, 3).join(',').trim();
          }
        }
      } catch (err) {}

      onMapClick(x, y, addressName);

      // Render temporary target marker
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng(e.latlng);
      } else {
        clickMarkerRef.current = L.marker(e.latlng, {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #06B6D4; width: 16px; height: 16px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 14px #06B6D4;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(map);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update existing complaint markers dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    complaints.forEach((cmp) => {
      const lat = 12.9716 + (cmp.x_coord - 250) / 10000;
      const lng = 77.5946 + (cmp.y_coord - 150) / 10000;

      const color = cmp.status === 'resolved' ? '#10B981' : cmp.status === 'investigating' ? '#3B82F6' : '#EF4444';
      
      const customIcon = L.divIcon({
        className: 'complaint-pin-icon',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px ${color};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
          <b style="color: #0F172A;">${cmp.title}</b><br/>
          <span style="color: #64748B;">Category: ${cmp.category}</span><br/>
          <span style="color: #3B82F6; font-weight: bold; text-transform: uppercase;">Status: ${cmp.status}</span>
        </div>
      `);
      markerGroup.addLayer(marker);
    });
  }, [complaints]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner border border-[#E2E8F0] dark:border-[#1E293B]">
      <div ref={mapContainerRef} className="w-full h-full" />
      <button
        type="button"
        onClick={() => mapInstanceRef.current && detectUserLocation(mapInstanceRef.current)}
        className="absolute bottom-4 right-4 z-[1000] px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-sky-500/30 rounded-xl shadow-lg backdrop-blur-md font-sans text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
      >
        <span>📍 Detect My Location</span>
      </button>
    </div>
  );
}
