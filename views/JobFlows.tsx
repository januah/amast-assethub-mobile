
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons } from '../constants';

export const TowingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Towing Operation" />
      <div className="flex-1 p-4 space-y-6">
        {step === 0 && (
          <div className="text-center py-10">
            <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.Truck className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold">Pick-up Request</h2>
            <p className="text-slate-500 mt-2">Ambulance WMX-4821 is stranded at MRR2 highway. Navigate to begin towing.</p>
            <button onClick={() => setStep(1)} className="w-full mt-10 py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg">Begin Navigation</button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">In Transit</h3>
            <Card className="bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl"><Icons.Navigation className="w-6 h-6" /></div>
                <div>
                  <div className="text-xs text-slate-400">Destination</div>
                  <div className="font-bold">Central Workshop (8.2km)</div>
                </div>
              </div>
            </Card>
            <button onClick={onComplete} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg">Confirm Arrival at Workshop</button>
          </div>
        )}
      </div>
    </div>
  );
};

export const RemovalFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [reason, setReason] = useState('Requires specialized tools');
  const [target, setTarget] = useState('Central BEM Lab');
  const [isSigned, setIsSigned] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Asset Removal" showBack onBack={onComplete} />
      <div className="flex-1 p-4 space-y-6 overflow-y-auto hide-scrollbar">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
             <Icons.Truck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-tight">Request Removal</h3>
            <p className="text-xs text-slate-500">Asset: Phillips Defibrillator (DF-002)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Removal</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none appearance-none font-bold text-slate-800"
            >
              <option>Requires specialized tools</option>
              <option>Major component replacement</option>
              <option>Laboratory calibration needed</option>
              <option>Environmental contamination</option>
              <option>End of life disposal</option>
            </select>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination Lab / Workshop</label>
             <div className="grid grid-cols-1 gap-2">
                {['Central BEM Lab', 'Vendor Service Center', 'Biomed HQ Workshop'].map((loc) => (
                  <button 
                    key={loc}
                    onClick={() => setTarget(loc)}
                    className={`p-4 rounded-2xl text-left text-sm font-bold border-2 transition-all flex items-center justify-between ${
                      target === loc ? 'border-sky-500 bg-sky-50 text-sky-600' : 'bg-white border-slate-100 text-slate-500'
                    }`}
                  >
                    {loc}
                    {target === loc && <Icons.Check className="w-4 h-4" />}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorizing Officer</label>
            {isSigned && <StatusBadge status="Completed" />}
          </div>
          <div 
            onClick={() => setIsSigned(true)}
            className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
              isSigned ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
            }`}
          >
            {isSigned ? (
               <div className="relative">
                 <div className="w-48 h-12 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Signature_of_John_Hancock.svg')] bg-contain bg-no-repeat bg-center opacity-70"></div>
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400 uppercase">Signed: Dr. Sarah Jones</div>
               </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <Icons.User className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Tap to Authorize</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <button 
          onClick={onComplete}
          disabled={!isSigned}
          className={`w-full py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isSigned ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Icons.Truck className="w-5 h-5" />
          Mark as Sent to Office
        </button>
      </div>
    </div>
  );
};

export const QuotationForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Icons.Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Quotation Sent!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The repair quotation has been successfully submitted to the <strong>Hospital Approver</strong>. You will be notified once it is reviewed.
        </p>
        <Card className="w-full mb-8 text-left border-emerald-100 bg-emerald-50/30">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Quote Reference</div>
          <div className="text-xl font-black text-slate-900">QTN-{Math.floor(Math.random() * 9000) + 1000}</div>
        </Card>
        <button 
          onClick={onComplete}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Submit Quotation" />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto hide-scrollbar">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
             <Icons.Finance className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-tight">Repair Costing</h3>
            <p className="text-xs text-slate-500">Ambulance WMX-4821</p>
          </div>
        </div>

        <Card className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Part Description</label>
            <input className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Engine Gasket Set" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Labor Hours</label>
            <input type="number" className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-emerald-500" placeholder="4" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Estimated Total (RM)</label>
            <div className="text-3xl font-black text-slate-900">RM 450.00</div>
            <p className="text-[10px] text-slate-400 mt-1">* Includes 6% SST where applicable</p>
          </div>
        </Card>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 mt-4">
          <Icons.Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-800 leading-tight">
            <strong>Approval Notice:</strong> Repairs exceeding RM 1,000.00 require additional authorization from the Head of Department.
          </p>
        </div>
      </div>
      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <button 
          onClick={() => setIsSubmitted(true)} 
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Send for Approval
        </button>
      </div>
    </div>
  );
};
