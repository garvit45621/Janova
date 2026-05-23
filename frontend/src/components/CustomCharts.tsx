'use client';

import React, { useState } from 'react';

// Donut Chart Interface
interface DonutData {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data, title }: { data: DonutData[]; title: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulatedAngle = 0;

  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const center = 80;

  return (
    <div className="glass-card flex flex-col gap-4 p-5">
      <h3 className="font-heading text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {data.map((item, idx) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const strokeLength = (percentage / 100) * circumference;
              const strokeDash = `${strokeLength} ${circumference - strokeLength}`;
              
              const currentAngle = total > 0 ? (accumulatedAngle / total) * 360 : 0;
              accumulatedAngle += item.value;

              const isHovered = hoveredIndex === idx;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeDashoffset={0}
                  transform={`rotate(${currentAngle} ${center} ${center})`}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">{total}</span>
            <span className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider">Total</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {data.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                hoveredIndex === idx ? 'bg-[#F1F5F9] dark:bg-[#172033]' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{item.label}</span>
                <span className="text-[10px] text-[#94A3B8]">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Bar Chart Interface
interface BarData {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({ data, title }: { data: BarData[]; title: string }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 140;

  return (
    <div className="glass-card flex flex-col gap-4 p-5">
      <h3 className="font-heading text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{title}</h3>
      <div className="flex items-end justify-between gap-2 pt-6 h-[160px] px-2 relative">
        {data.map((item, idx) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <div 
              key={idx} 
              className="flex-1 flex flex-col items-center gap-2 group relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute -top-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold py-1 px-2.5 rounded-md shadow-lg transition-all animate-scale-in z-10 whitespace-nowrap">
                  {item.value} Reports
                </div>
              )}

              <div 
                className="w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative"
                style={{
                  height: `${barHeight}px`,
                  background: isHovered 
                    ? `linear-gradient(180deg, ${item.color || '#3B82F6'} 0%, rgba(59, 130, 246, 0.4) 100%)`
                    : `linear-gradient(180deg, ${item.color || '#3B82F6'}CC 0%, rgba(59, 130, 246, 0.1) 100%)`,
                  cursor: 'pointer',
                  boxShadow: isHovered ? `0 4px 12px ${item.color || '#3B82F6'}40` : 'none'
                }}
              />
              <span className="text-[10px] text-[#94A3B8] font-medium text-center truncate w-full max-w-[48px]">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Line Chart Interface
interface LineData {
  label: string;
  value: number;
}

export function LineChart({ data, title }: { data: LineData[]; title: string }) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 500;
  const height = 180;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.value / maxValue) * (height - 2 * padding);
    return { x, y, val: d.value, label: d.label };
  });

  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  return (
    <div className="glass-card flex flex-col gap-4 p-5">
      <h3 className="font-heading text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{title}</h3>
      <div className="relative pt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] h-[180px]">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2E8F0" strokeWidth="0.5" className="dark:stroke-[#1E293B]" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E2E8F0" strokeWidth="0.5" className="dark:stroke-[#1E293B]" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2E8F0" strokeWidth="1" className="dark:stroke-[#1E293B]" />

          <path d={areaD} fill="url(#areaGrad)" />
          <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === i ? 6 : 4}
                fill={hoveredPoint === i ? "#3B82F6" : "#FFFFFF"}
                stroke="#3B82F6"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <text 
                x={p.x} 
                y={height - 4} 
                fontSize="8" 
                fill="#94A3B8" 
                textAnchor="middle"
                fontWeight="500"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
        
        {hoveredPoint !== null && (
          <div className="absolute top-0 right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold py-1.5 px-3 rounded-md shadow-md animate-scale-in">
            {data[hoveredPoint].label}: <span className="text-blue-500">${data[hoveredPoint].value.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
