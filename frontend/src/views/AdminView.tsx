'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface MetricData {
  activeUsers: number;
  complaintsCount: number;
  applicationsCount: number;
  servicesCount: number;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

interface AdminUser {
  user_id: number;
  full_name: string;
  citizen_id: string;
  phone: string;
}

export default function AdminView() {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const resStats = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`);
      if (resStats.ok) {
        const data = await resStats.json();
        setMetrics(data.metrics);
        setLogs(data.logs);
      }

      const resUsers = await fetch(`${API_BASE_URL}/api/admin/users`);
      if (resUsers.ok) {
        setUsers(await resUsers.json());
      }
    } catch (e) {
      console.error("Admin data load failed", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center py-12 text-xs text-[#94A3B8] font-bold animate-pulse">Loading Admin Control Panel...</p>;
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Citizens", value: metrics?.activeUsers ?? 1, color: "blue", tag: "Users DB" },
          { title: "Civic Complaints", value: metrics?.complaintsCount ?? 0, color: "red", tag: "Complaints DB" },
          { title: "Active Applications", value: metrics?.applicationsCount ?? 0, color: "warning", tag: "Applications" },
          { title: "Services Directory", value: metrics?.servicesCount ?? 0, color: "emerald", tag: "Services Marketplace" }
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-5 flex justify-between items-center relative overflow-hidden group">
            <div className="flex flex-col gap-1.5 z-10">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{item.title}</span>
              <span className="text-2xl font-bold tracking-tight">{item.value}</span>
              <span className="badge badge-primary w-fit text-[8px] mt-1">{item.tag}</span>
            </div>
            <div className="text-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B] h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
              🛡️
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* User profile listings (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">User Management Registry</h3>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {users.map((usr) => (
                <div key={usr.user_id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B]/70 flex justify-between items-center gap-4 text-xs font-semibold">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">{usr.full_name}</span>
                    <span className="text-[9px] text-[#94A3B8]">ID: {usr.citizen_id} • User UID: {usr.user_id}</span>
                  </div>
                  <span className="text-[10px] text-[#475569] dark:text-[#E2E8F0]">{usr.phone || 'No Contact'}</span>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B]/70 flex justify-between items-center gap-4 text-xs font-semibold">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">Aria Sterling</span>
                    <span className="text-[9px] text-[#94A3B8]">ID: JV-982-110 • User UID: 1</span>
                  </div>
                  <span className="text-[10px] text-[#475569] dark:text-[#E2E8F0]">+1 (555) 019-2831</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System logs view (Col: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Security System Logs</h3>
            <div className="flex flex-col gap-3 font-mono text-[9px] max-h-[350px] overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#0B0F19] border border-slate-800 text-slate-300 leading-normal">
                  <span className="text-[#94A3B8] font-sans">[{log.timestamp}]</span>{' '}
                  <span className={log.level === 'WARN' ? 'text-amber-500 font-bold' : 'text-blue-500 font-bold'}>{log.level}</span>{' '}
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
