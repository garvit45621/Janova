'use client';

import React, { createContext, useState, useEffect } from 'react';
import { User, Document, Service, Scheme, Complaint, Application, Deadline, Notification, BusinessTemplate, LifeEvent, Checklist } from '../types';

interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
  applications: Application[];
  documents: Document[];
  complaints: Complaint[];
  deadlines: Deadline[];
  services: Service[];
  schemes: Scheme[];
  bizTemplates: BusinessTemplate[];
  lifeEvents: LifeEvent[];
  activeView: string;
  setActiveView: (view: string) => void;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, address: string, password: string) => Promise<boolean>;
  logout: () => void;
  reloadUserData: () => Promise<void>;
  submitServiceApplication: (title: string, category: string) => Promise<void>;
  uploadFile: (name: string, category: string, size: string) => Promise<void>;
  removeFile: (id: number) => Promise<void>;
  submitCivicComplaint: (title: string, category: string, description: string, location: string, x: number, y: number) => Promise<void>;
  upvoteCivicComplaint: (id: number) => Promise<void>;
  createPersonalDeadline: (title: string, date: string, type: string, urgency: string) => Promise<void>;
  updateNotificationStatus: () => void;
  updateUserProfile: (name: string, phone: string, address: string, prefs: any, twoFactor: boolean) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  // Database states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [bizTemplates, setBizTemplates] = useState<BusinessTemplate[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);

  // Load theme and user from storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('janova-theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);

    const savedUser = localStorage.getItem('janova-user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    }

    // Fetch static seeds (services, schemes, templates, life events)
    fetchStaticData();
  }, []);

  // Sync theme HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('janova-theme', theme);
  }, [theme]);

  // Sync user data whenever user logs in
  useEffect(() => {
    if (user) {
      reloadUserData();
    }
  }, [user?.id]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchStaticData = async () => {
    try {
      const resSrv = await fetch('http://localhost:8000/api/services/list');
      if (resSrv.ok) setServices(await resSrv.json());

      const resSch = await fetch('http://localhost:8000/api/services/schemes');
      if (resSch.ok) setSchemes(await resSch.json());

      const resBiz = await fetch('http://localhost:8000/api/services/business/templates');
      if (resBiz.ok) setBizTemplates(await resBiz.json());

      const resEv = await fetch('http://localhost:8000/api/services/life-events');
      if (resEv.ok) setLifeEvents(await resEv.json());

      const resCmp = await fetch('http://localhost:8000/api/complaints/list');
      if (resCmp.ok) setComplaints(await resCmp.json());
    } catch (e) {
      console.warn("Backend connection failed, using dummy static sets.", e);
    }
  };

  const reloadUserData = async () => {
    if (!user) return;
    try {
      // Fetch Documents
      const resDoc = await fetch(`http://localhost:8000/api/vault/${user.id}`);
      if (resDoc.ok) {
        const data = await resDoc.json();
        setDocuments(data.documents || []);
      }

      // Fetch Applications
      const resApp = await fetch(`http://localhost:8000/api/services/applications/${user.id}`);
      if (resApp.ok) setApplications(await resApp.json());

      // Fetch Deadlines
      const resDl = await fetch(`http://localhost:8000/api/calendar/${user.id}`);
      if (resDl.ok) setDeadlines(await resDl.json());

      // Reload complaints
      const resCmp = await fetch('http://localhost:8000/api/complaints/list');
      if (resCmp.ok) setComplaints(await resCmp.json());

    } catch (e) {
      console.error("Error reloading citizen details", e);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('janova-user', JSON.stringify(data.user));
        return true;
      }
    } catch (e) {
      console.error("Login request failed", e);
    }
    return false;
  };

  const register = async (name: string, email: string, phone: string, address: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('janova-user', JSON.stringify(data.user));
        return true;
      }
    } catch (e) {
      console.error("Registration request failed", e);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('janova-user');
    setActiveView('landing');
  };

  const submitServiceApplication = async (title: string, category: string) => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:8000/api/services/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, title, category })
      });
      if (res.ok) {
        await reloadUserData();
      }
    } catch (e) {
      console.error("Apply request failed", e);
    }
  };

  const uploadFile = async (name: string, category: string, size: string) => {
    if (!user) return;
    try {
      const body = new FormData();
      body.append('user_id', user.id.toString());
      body.append('name', name);
      body.append('category', category);
      body.append('size', size);

      const res = await fetch('http://localhost:8000/api/vault/upload', {
        method: 'POST',
        body
      });
      if (res.ok) {
        await reloadUserData();
      }
    } catch (e) {
      console.error("Upload file failed", e);
    }
  };

  const removeFile = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/vault/delete/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await reloadUserData();
      }
    } catch (e) {
      console.error("Delete file failed", e);
    }
  };

  const submitCivicComplaint = async (title: string, category: string, description: string, location: string, x: number, y: number) => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:8000/api/complaints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, title, category, description, location, x_coord: x, y_coord: y })
      });
      if (res.ok) {
        await reloadUserData();
      }
    } catch (e) {
      console.error("Submit complaint failed", e);
    }
  };

  const upvoteCivicComplaint = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/upvote/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        await reloadUserData();
      }
    } catch (e) {
      console.error("Upvote failed", e);
    }
  };

  const createPersonalDeadline = async (title: string, date: string, type: string, urgency: string) => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:8000/api/calendar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, title, date, type, urgency })
      });
      if (res.ok) {
        await reloadUserData();
      }
    } catch (e) {
      console.error("Create deadline failed", e);
    }
  };

  const updateNotificationStatus = () => {
    // Marks all as read simple trigger
    setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
  };

  const updateUserProfile = async (name: string, phone: string, address: string, prefs: any, twoFactor: boolean) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:8000/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, phone, address, notification_preferences: prefs, two_factor_enabled: twoFactor })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = {
          ...user,
          name: data.profile.name,
          phone: data.profile.phone,
          address: data.profile.address,
          notificationPreferences: data.profile.notificationPreferences,
          twoFactorEnabled: data.profile.twoFactorEnabled
        };
        setUser(updatedUser);
        localStorage.setItem('janova-user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Profile update failed", e);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      theme,
      notifications,
      applications,
      documents,
      complaints,
      deadlines,
      services,
      schemes,
      bizTemplates,
      lifeEvents,
      activeView,
      setActiveView,
      toggleTheme,
      login,
      register,
      logout,
      reloadUserData,
      submitServiceApplication,
      uploadFile,
      removeFile,
      submitCivicComplaint,
      upvoteCivicComplaint,
      createPersonalDeadline,
      updateNotificationStatus,
      updateUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};
