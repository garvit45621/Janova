'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function SettingsView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, updateUserProfile } = context;

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  
  const [emailNotif, setEmailNotif] = useState(user?.notificationPreferences?.email ?? true);
  const [smsNotif, setSmsNotif] = useState(user?.notificationPreferences?.sms ?? true);
  const [pushNotif, setPushNotif] = useState(user?.notificationPreferences?.push ?? false);
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled ?? true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setError('Please fill in all core credentials.');
      return;
    }

    setSuccess(false);
    await updateUserProfile(name, phone, address, { email: emailNotif, sms: smsNotif, push: pushNotif }, twoFactor);
    setSuccess(true);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-3xl mx-auto w-full animate-scale-in text-left">
      <div className="glass-card p-5 flex flex-col gap-5">
        <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
          <h3 className="font-heading text-sm font-bold uppercase text-[#94A3B8] tracking-wider">Citizen Settings Workspace</h3>
          <p className="text-[10px] text-[#94A3B8] mt-0.5">Manage demographic files, alerts, and 2FA credentials.</p>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500">{error}</div>}
        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500">Settings saved successfully!</div>}

        <form onSubmit={handleSave} className="flex flex-col gap-6 pt-2">
          
          {/* Demographic Section */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Demographic Records</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Full Legal Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); setSuccess(false); }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Registered Phone</label>
                <input 
                  type="tel" 
                  className="form-control"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); setSuccess(false); }}
                />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Residential Address</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setError(''); setSuccess(false); }}
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="flex flex-col gap-4 border-t border-[#E2E8F0] dark:border-[#1E293B]/70 pt-6">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-sans">Alert Preferences</span>
            <div className="flex flex-col gap-3.5">
              <label className="form-checkbox text-xs font-semibold">
                <input 
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => { setEmailNotif(e.target.checked); setSuccess(false); }}
                />
                Receive email alerts on application status updates
              </label>

              <label className="form-checkbox text-xs font-semibold">
                <input 
                  type="checkbox"
                  checked={smsNotif}
                  onChange={(e) => { setSmsNotif(e.target.checked); setSuccess(false); }}
                />
                Receive SMS updates on civic complaints investigations
              </label>

              <label className="form-checkbox text-xs font-semibold">
                <input 
                  type="checkbox"
                  checked={pushNotif}
                  onChange={(e) => { setPushNotif(e.target.checked); setSuccess(false); }}
                />
                Receive real-time push reminders for deadlines
              </label>
            </div>
          </div>

          {/* Security Section */}
          <div className="flex flex-col gap-4 border-t border-[#E2E8F0] dark:border-[#1E293B]/70 pt-6">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Identity Security</span>
            <label className="form-checkbox text-xs font-semibold">
              <input 
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => { setTwoFactor(e.target.checked); setSuccess(false); }}
              />
              Activate Two-Factor Authentication (2FA) for Vault downloads
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] mt-2">
            <button type="submit" className="btn btn-primary px-8 py-3">
              Save Settings
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
