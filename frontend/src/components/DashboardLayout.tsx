'use client';

import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = useContext(AppContext);
  if (!context) return null;
  const { 
    theme, 
    toggleTheme, 
    activeView, 
    setActiveView, 
    user, 
    logout, 
    notifications, 
    updateNotificationStatus 
  } = context;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'services', label: 'Services Portal', icon: '🛒' },
    { id: 'benefits', label: 'Benefits Finder', icon: '🎁' },
    { id: 'vault', label: 'Document Vault', icon: '📂' },
    { id: 'lifeevents', label: 'Life Events', icon: '🎯' },
    { id: 'business', label: 'Business Hub', icon: '🏢' },
    { id: 'complaints', label: 'Complaints Map', icon: '🗺️' },
    { id: 'calendar', label: 'Smart Calendar', icon: '📅' },
  ];

  if (user && user.role === 'admin') {
    // Add admin option
    if (!menuItems.some(i => i.id === 'admin')) {
      menuItems.push({ id: 'admin', label: 'Admin Dashboard', icon: '🛡️' });
    }
  }

  const navigateTo = (viewId: string) => {
    setActiveView(viewId);
    setIsMobileOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  };

  const handleNotifClick = () => {
    setIsNotifOpen(!isNotifOpen);
    setIsProfileOpen(false);
    updateNotificationStatus();
  };

  const pageTitle = menuItems.find(item => item.id === activeView)?.label || 
                    (activeView === 'settings' ? 'Account Settings' : 'Workspace');

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#080D1A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300">
      
      {/* Sidebar (Desktop) */}
      <aside className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col justify-between border-r border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626] transition-all duration-300 ${
        isSidebarCollapsed ? 'w-[78px]' : 'w-[260px]'
      } hidden md:flex`}>
        <div>
          <div className="flex h-[72px] items-center justify-between px-5 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigateTo('dashboard')}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-extrabold shadow-md">J</div>
              {!isSidebarCollapsed && <span className="font-heading text-lg font-bold tracking-tight text-gradient">Janova.</span>}
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              {isSidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 p-4">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`flex items-center gap-3.5 w-full rounded-xl px-4 py-3.5 text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
                  }`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile drawer at bottom */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigateTo('settings')}>
              <img src={user?.photo} alt="Profile" className="h-9 w-9 rounded-xl object-cover" />
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate">{user?.name}</span>
                  <span className="text-[10px] text-[#94A3B8] truncate">{user?.email}</span>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button onClick={logout} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg">
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className={`flex flex-col min-h-screen flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-[78px]' : 'md:ml-[260px]'
      }`}>
        
        {/* Header Bar */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/80 dark:bg-[#0F1626]/80 backdrop-blur-md px-6 md:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="rounded-xl p-2 bg-[#F1F5F9] dark:bg-[#172033] md:hidden">
              🍔
            </button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <button onClick={toggleTheme} className="btn-icon rounded-xl p-2.5 bg-[#F1F5F9] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#1E293B] cursor-pointer">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Notification bell dropdown */}
            <div className="relative">
              <button onClick={handleNotifClick} className="relative btn-icon rounded-xl p-2.5 bg-[#F1F5F9] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#1E293B] cursor-pointer">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0F1626]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626] p-4 shadow-xl animate-scale-in z-50">
                  <div className="mb-2 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2">
                    <span className="text-xs font-bold">Unread Alerts</span>
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-[#94A3B8]">No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="flex gap-2.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">
                          <span className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          <span>{n.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Link shortcut */}
            <button onClick={() => navigateTo('settings')} className="flex items-center gap-2 rounded-xl p-1.5 border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F1F5F9] dark:bg-[#172033] cursor-pointer">
              <img src={user?.photo} alt="" className="h-7 w-7 rounded-lg object-cover" />
            </button>
          </div>
        </header>

        {/* Content wrap */}
        <main className="flex-1 p-6 md:p-8 z-10">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-[#080D1A]/50 backdrop-blur-sm" />
          <div className="relative flex w-72 max-w-xs flex-col bg-white dark:bg-[#0F1626] border-r border-[#E2E8F0] dark:border-[#1E293B] p-5 shadow-2xl animate-scale-in">
            <div className="mb-6 flex justify-between items-center">
              <span className="font-heading text-base font-bold">Janova Portal</span>
              <button onClick={() => setIsMobileOpen(false)}>✕</button>
            </div>
            <nav className="flex flex-col gap-1.5 flex-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`flex items-center gap-3.5 w-full rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    activeView === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-[#475569] dark:text-[#94A3B8]'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
}
