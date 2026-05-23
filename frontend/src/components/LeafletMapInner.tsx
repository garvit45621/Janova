'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint } from '../types';

interface LeafletMapInnerProps {
  complaints: Complaint[];
  selectedX: number;
  selectedY: number;
  onMapClick: (x: number, y: number) => void;
}

export default function LeafletMapInner({ complaints, selectedX, selectedY, onMapClick }: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Setup Leaflet icon fallback fixes
  useEffect(() => {
    // Override default leaflet marker asset paths simply
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map centered on a simulated city coordinate
    const initialLat = 12.9716;
    const initialLng = 77.5946;
    
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markerGroupRef.current = markerGroup;

    // Register Click Listener
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      // Convert coordinates simply to relative integer coordinates for database
      const x = Math.round((lat - initialLat) * 10000 + 250);
      const y = Math.round((lng - initialLng) * 10000 + 150);
      
      onMapClick(x, y);

      // Render temporary target marker
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng(e.latlng);
      } else {
        clickMarkerRef.current = L.marker(e.latlng, {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #06B6D4; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #06B6D4;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
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
      // Map relative coordinates back to lat/lng for display
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

  return <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-[#E2E8F0] dark:border-[#1E293B]" />;
}
