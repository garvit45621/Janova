'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function BusinessView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { bizTemplates, submitServiceApplication, uploadFile } = context;

  const [activeBiz, setActiveBiz] = useState<string>('Startup');
  
  // Visual workflow stages
  const [bizInputs, setBizInputs] = useState({ name: '', checkTerms: false });
  const [isFormed, setIsFormed] = useState(false);
  const [charterNum, setCharterNum] = useState('');
  const [error, setError] = useState('');

  const currentTemplate = bizTemplates.find(b => b.name.toLowerCase() === activeBiz.toLowerCase()) || bizTemplates[0];

  const handleSubmitLLC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizInputs.name) {
      setError('Please provide corporate trade name.');
      return;
    }
    if (!bizInputs.checkTerms) {
      setError('Please acknowledge registration compliance requirements.');
      return;
    }

    const licenseId = `LLC-${Math.floor(100000 + Math.random() * 900000)}`;
    setCharterNum(licenseId);
    setIsFormed(true);

    if (currentTemplate) {
      await submitServiceApplication(`Business Registration: ${bizInputs.name} ${activeBiz}`, "Business Portal");
    }
  };

  const handleReset = () => {
    setBizInputs({ name: '', checkTerms: false });
    setIsFormed(false);
    setCharterNum('');
    setError('');
  };

  const handleExportPDF = () => {
    const filingDate = new Date().toISOString().split('T')[0];
    const companyName = bizInputs.name || 'Sterling Startup';

    // Auto-save into Document Vault
    if (uploadFile) {
      uploadFile(`${companyName}_State_Treasury_Charter.pdf`, "Business", "1.2 MB");
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download or print your official Digital Charter Certificate PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>State Treasury Digital Charter Certificate - ${companyName}</title>
        <style>
          @page { size: A4 portrait; margin: 20px; }
          body {
            font-family: 'Times New Roman', Georgia, serif;
            margin: 0;
            padding: 30px;
            background: #ffffff;
            color: #0f172a;
          }
          .certificate-container {
            border: 10px double #1e3a8a;
            padding: 40px;
            text-align: center;
            position: relative;
            min-height: 840px;
            background: #fffdfa;
            box-sizing: border-box;
          }
          .header-seal {
            font-size: 48px;
            margin-bottom: 8px;
          }
          .govt-title {
            font-family: Arial, sans-serif;
            font-size: 13px;
            letter-spacing: 4px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          .main-title {
            font-size: 26px;
            font-weight: bold;
            color: #0f172a;
            margin: 15px 0 5px 0;
          }
          .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 25px;
            font-style: italic;
          }
          .details-box {
            border: 2px solid #cbd5e1;
            padding: 25px;
            margin: 25px 0;
            text-align: left;
            background: #ffffff;
            border-radius: 8px;
          }
          .detail-row {
            margin-bottom: 15px;
          }
          .label {
            font-family: Arial, sans-serif;
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .value {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 2px;
          }
          .seal-stamp {
            position: absolute;
            bottom: 50px;
            right: 50px;
            width: 105px;
            height: 105px;
            border: 3px dashed #d97706;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #d97706;
            font-family: Arial, sans-serif;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            transform: rotate(-12deg);
            text-align: center;
            line-height: 12px;
          }
          .footer-text {
            position: absolute;
            bottom: 25px;
            left: 0;
            right: 0;
            font-size: 10px;
            color: #94a3b8;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="header-seal">👑</div>
          <div class="govt-title">State Treasury & Ministry of Corporate Affairs</div>
          <div class="main-title">STATE TREASURY CHARTER CERTIFICATE</div>
          <div class="subtitle">Articles of Organization Registered & Validated</div>

          <div class="details-box">
            <div class="detail-row">
              <div class="label">Company Legal Designation</div>
              <div class="value">${companyName} (${activeBiz})</div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 15px;">
              <div class="detail-row">
                <div class="label">Filing Date</div>
                <div class="value" style="color: #0f172a; font-size: 15px;">${filingDate}</div>
              </div>

              <div class="detail-row">
                <div class="label">Filing License ID</div>
                <div class="value" style="font-family: monospace; color: #d97706; font-size: 16px;">${charterNum}</div>
              </div>
            </div>

            <div class="detail-row" style="margin-top: 15px;">
              <div class="label">Approved Compliance Licenses</div>
              <div style="font-size: 12px; font-family: Arial, sans-serif; margin-top: 6px; color: #334155;">
                ${currentTemplate ? currentTemplate.licenses.map(l => '📌 ' + l).join(' &nbsp;•&nbsp; ') : 'Standard Registration Compliance'}
              </div>
            </div>
          </div>

          <p style="font-size: 13px; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #334155;">
            This certifies that <strong>${companyName}</strong> has satisfied all statutory state incorporation guidelines and is officially recognized to conduct business under registered license ID <strong>${charterNum}</strong>.
          </p>

          <div class="seal-stamp">
            SEAL OF<br/>JANOVA<br/>STATE TREASURY
          </div>

          <div class="footer-text">
            Digitally Verified & Validated via Janova GovTech Portal • License Code: ${charterNum}-${Date.now()}
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      {!isFormed ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Business Model type selector cards (Col: 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-5 flex flex-col gap-4">
              <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Corporate Models</h3>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {bizTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => { setActiveBiz(template.name); handleReset(); }}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activeBiz === template.name
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-[#E2E8F0] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#172033]'
                    }`}
                  >
                    <span className="text-xs font-bold">{template.name} Registry</span>
                    <span className="text-[10px] text-[#94A3B8] mt-1 leading-normal">Filing timeline: {template.timeline}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Business templates details checklist (Col: 8) */}
          {currentTemplate && (
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Requirements widget */}
              <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold">Registration Timeline</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-500 mt-1">{currentTemplate.timeline}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold">Estimated Setup Cost</span>
                  <span className="text-sm font-bold text-emerald-500 mt-1">{currentTemplate.estimated_cost}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold">Required Approvals</span>
                  <span className="text-xs font-bold mt-1 text-[#475569] dark:text-[#E2E8F0]">{currentTemplate.approvals.join(', ')}</span>
                </div>
              </div>

              {/* Specific Licenses Lists */}
              <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Required Licenses</h4>
                  <div className="flex flex-col gap-2">
                    {currentTemplate.licenses.map((lic, idx) => (
                      <span key={idx} className="text-xs font-semibold flex items-center gap-2">📌 {lic}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-xs font-bold text-[#94A3B8] uppercase tracking-wider font-sans">Compliance Checklist</h4>
                  <div className="flex flex-col gap-2">
                    {currentTemplate.compliance_checklist.map((cmp, idx) => (
                      <span key={idx} className="text-xs font-semibold flex items-center gap-2">⚖️ {cmp}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <div className="glass-card p-5 flex flex-col gap-4 text-left">
                <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Submit Setup Charter</h3>
                
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500">{error}</div>}

                <form onSubmit={handleSubmitLLC} className="flex flex-col gap-4 pt-1">
                  <div className="form-group">
                    <label className="form-label">Corporate Trade Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder={`e.g. Sterling ${activeBiz}`}
                      value={bizInputs.name}
                      onChange={(e) => { setBizInputs(prev => ({ ...prev, name: e.target.value })); setError(''); }}
                    />
                  </div>

                  <label className="form-checkbox text-xs font-semibold">
                    <input 
                      type="checkbox"
                      checked={bizInputs.checkTerms}
                      onChange={(e) => { setBizInputs(prev => ({ ...prev, checkTerms: e.target.checked })); setError(''); }}
                    />
                    Acknowledge the regulatory {currentTemplate.name} compliance rules
                  </label>

                  <button type="submit" className="btn btn-primary w-full py-3">
                    Register and Issue License
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* Generated Digital Charter Certificate view */
        <div className="glass-card max-w-xl mx-auto w-full p-8 flex flex-col items-center gap-6 text-center animate-scale-in relative border-2 border-amber-500/20 shadow-2xl">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl shadow-inner">👑</div>
          
          <div className="flex flex-col gap-1 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4 w-full">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Articles of Organization Registered</span>
            <h2 className="text-2xl font-black tracking-tight">Digital Charter Approved!</h2>
            <p className="text-xs text-[#94A3B8]">Your corporate listing has been generated successfully.</p>
          </div>

          <div className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#1E293B] p-6 rounded-2xl text-left font-serif relative shadow-md">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-[#94A3B8] border-b border-dashed border-[#E2E8F0] dark:border-[#1E293B] pb-3 mb-4">
              State Treasury Charter Certificate
            </div>
            
            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <span className="font-sans font-bold text-[#94A3B8] uppercase text-[9px] block">Company legal designation</span>
                <span className="font-black text-base tracking-wide text-blue-600 dark:text-blue-400">{bizInputs.name} ({activeBiz})</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-sans font-bold text-[#94A3B8] uppercase text-[9px] block">Filing Date</span>
                  <span className="font-bold" suppressHydrationWarning>{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div>
                  <span className="font-sans font-bold text-[#94A3B8] uppercase text-[9px] block">Filing License ID</span>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400">{charterNum}</span>
                </div>
              </div>
            </div>

            {/* Official Seal */}
            <div className="absolute bottom-4 right-4 h-14 w-14 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center text-[7px] font-sans font-black text-amber-500 uppercase text-center leading-[9px] rotate-12 shadow-sm">
              Seal of<br/>Janova
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={handleExportPDF} 
              className="btn bg-blue-600 hover:bg-blue-500 text-white flex-1 py-3 text-xs font-bold shadow cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>Export Official PDF Charter</span>
            </button>
            <button 
              onClick={handleReset} 
              className="btn btn-secondary flex-1 py-3 text-xs font-bold cursor-pointer"
            >
              Form Another Business
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
