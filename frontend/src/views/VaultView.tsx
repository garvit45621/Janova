'use client';

import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Document } from '../types';

export default function VaultView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, documents, uploadFile, removeFile } = context;

  const [activeFolder, setActiveFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload progress simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Identity' | 'Education' | 'Property' | 'Tax' | 'Healthcare'>('Identity');
  
  // Share link triggers
  const [activeShareDoc, setActiveShareDoc] = useState<Document | null>(null);
  const [shareHours, setShareHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState('');

  // Missing documents and expiring documents lists (Calculated dynamically)
  const [missingDocs, setMissingDocs] = useState<string[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<Document[]>([]);

  useEffect(() => {
    if (documents) {
      const categories = documents.map(d => d.category);
      const missing: string[] = [];
      if (!categories.includes('Identity')) missing.push('Identity Verification (ID Card)');
      if (!categories.includes('Tax')) missing.push('Annual Tax Statement');
      setMissingDocs(missing);

      setExpiringDocs(documents.filter(d => {
        if (!d.expiry_date) return false;
        const daysLeft = Math.round((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        return daysLeft <= 30 && daysLeft >= 0;
      }));
    }
  }, [documents]);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startSimulateUpload(file.name);
    }
  };

  const startSimulateUpload = (fileName: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadName(fileName);

    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            await uploadFile(fileName, uploadCategory, `${(Math.random() * 3 + 1).toFixed(1)} MB`);
            setIsUploading(false);
          }, 300);
          return 100;
        }
        return p + 20;
      });
    }, 150);
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShareDoc) return;

    try {
      const res = await fetch('http://localhost:8000/api/vault/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: activeShareDoc.id, duration_hours: shareHours })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedLink(data.share_url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCat = activeFolder === 'All' || doc.category === activeFolder;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const folders = ['All', 'Identity', 'Education', 'Property', 'Tax', 'Healthcare'];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      
      {/* Alert widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Missing documents widget */}
        <div className="glass-card p-5 border-l-4 border-amber-500 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Required Missing Documents</h4>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            {missingDocs.map((item, idx) => (
              <span key={idx} className="text-xs font-semibold text-[#D97706] flex items-center gap-1.5">⚠️ {item}</span>
            ))}
            {missingDocs.length === 0 && <span className="text-xs text-emerald-500 font-bold">✓ All core identity records verified.</span>}
          </div>
        </div>

        {/* Expiring documents widget */}
        <div className="glass-card p-5 border-l-4 border-red-500 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Expiring / Expired Files</h4>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            {expiringDocs.map((doc) => (
              <span key={doc.id} className="text-xs font-semibold text-red-500 flex items-center justify-between">
                <span>🚨 {doc.name}</span>
                <span className="text-[10px] font-bold text-[#94A3B8]">{doc.expiry_date}</span>
              </span>
            ))}
            {expiringDocs.length === 0 && <span className="text-xs text-[#94A3B8]">No files expiring soon.</span>}
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Folder selectors (Col: 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass-card p-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-2">Folders</span>
            <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none">
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left shrink-0 transition-colors w-full cursor-pointer ${
                    activeFolder === folder
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
                  }`}
                >
                  📁 {folder} Documents
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Card and Files list (Col: 9) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Upload Dropzone */}
          <div className="glass-card p-8 border-dashed border-2 border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl flex flex-col items-center justify-center text-center gap-4 relative">
            {isUploading ? (
              <div className="flex flex-col items-center w-full max-w-xs gap-3">
                <span className="text-xs font-semibold">Encrypting and uploading {uploadName}...</span>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold">{uploadProgress}% Complete</span>
              </div>
            ) : (
              <>
                <span className="text-lg bg-blue-500/10 text-blue-500 p-2.5 rounded-xl">📤</span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold">Select and upload verification certificates</span>
                  <span className="text-[10px] text-[#94A3B8]">Supports PDF, PNG, JPG scans up to 20MB</span>
                </div>
                
                {/* Folder target selection */}
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-[#94A3B8]">SET TARGET FOLDER:</span>
                  <select 
                    className="form-control !py-1 !px-2.5 text-[10px] font-bold"
                    value={uploadCategory}
                    onChange={(e: any) => setUploadCategory(e.target.value)}
                  >
                    {folders.filter(f => f !== 'All').map(folder => (
                      <option key={folder} value={folder}>{folder}</option>
                    ))}
                  </select>
                </div>

                <label className="btn btn-primary text-xs py-2 px-5 cursor-pointer mt-1">
                  Browse Files
                  <input type="file" className="hidden" onChange={handleSelectFile} />
                </label>
              </>
            )}
          </div>

          {/* Files List */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-heading text-xs font-bold uppercase text-[#94A3B8] tracking-wider">Vault Files Inventory ({filteredDocs.length})</h3>
              
              <input 
                type="text" 
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg bg-[#F1F5F9] dark:bg-[#172033] px-3 py-1.5 text-[10px] text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B]/70 flex justify-between items-center gap-4 hover:scale-[1.005] transition-transform">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xl bg-blue-500/10 p-2 rounded-lg">📄</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{doc.name}</span>
                      <span className="text-[10px] text-[#94A3B8]">{doc.size} • Folder: {doc.category} • Uploaded: {doc.upload_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`badge ${doc.verified ? 'badge-success' : 'badge-warning'} text-[8px] font-bold shrink-0`}>
                      {doc.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                    
                    <button 
                      onClick={() => setActiveShareDoc(doc)}
                      className="text-slate-400 hover:text-blue-500 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs cursor-pointer"
                      title="Share link"
                    >
                      🔗
                    </button>
                    <button 
                      onClick={() => removeFile(doc.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs cursor-pointer"
                      title="Delete file"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {filteredDocs.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-6">No files in folder.</p>}
            </div>
          </div>

        </div>

      </div>

      {/* RENDER SHARE MODAL */}
      {activeShareDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#080D1A]/50 backdrop-blur-sm" onClick={() => { setActiveShareDoc(null); setGeneratedLink(''); }} />
          
          <div className="glass rounded-2xl w-full max-w-sm shadow-2xl p-6 relative border border-[#E2E8F0]/30 dark:border-[#1E293B]/40 z-10 animate-scale-in flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-heading text-sm font-bold">Secure Share: {activeShareDoc.name}</h3>
              <button onClick={() => { setActiveShareDoc(null); setGeneratedLink(''); }}>✕</button>
            </div>

            <form onSubmit={handleShareSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Link Validity Duration (Hours)</label>
                <select 
                  className="form-control"
                  value={shareHours}
                  onChange={(e) => setShareHours(Number(e.target.value))}
                >
                  <option value={1}>1 hour</option>
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full py-2">
                Generate Secure Link
              </button>
            </form>

            {generatedLink && (
              <div className="flex flex-col gap-2 border-t border-[#E2E8F0] dark:border-[#1E293B] pt-4 mt-2">
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Secure Link Generated:</span>
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink}
                  className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-[10px] font-mono outline-none border border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
