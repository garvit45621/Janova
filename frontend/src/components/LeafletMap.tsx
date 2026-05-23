'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Complaint } from '../types';

interface LeafletMapProps {
  complaints: Complaint[];
  selectedX: number;
  selectedY: number;
  onMapClick: (x: number, y: number) => void;
}

// Dynamically import Inner Leaflet component with SSR disabled
const DynamicMapInner = dynamic(
  () => import('./LeafletMapInner'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl bg-slate-900/10 dark:bg-slate-900/50 flex items-center justify-center border border-dashed border-[#E2E8F0] dark:border-[#1E293B]">
        <span className="text-xs text-[#94A3B8] font-bold animate-pulse">Loading Municipal Satellite Map...</span>
      </div>
    )
  }
);

export default function LeafletMap(props: LeafletMapProps) {
  return <DynamicMapInner {...props} />;
}
