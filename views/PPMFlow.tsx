
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons } from '../constants';

interface Slot {
  id: number;
  date: string;
  time: string;
  engineer: string;
}

export const PPMFlow: React.FC<{ onComplete: () => void; onCancel: () => void }> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'select' | 'request_new' | 'success' | 'request_success'>('select');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  // New Request Form State
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const assetInfo = {
    name: 'Phillips Defibrillator X3',
    id: 'DF-002',
    location: 'Ward 4B',
    lastService: '12 Oct 2022'
  };

  const dates: Slot[] = [
    { id: 1, date: 'Monday, 12 Nov', time: '09:00 AM', engineer: 'Eng. Zul' },
    { id: 2, date: 'Wednesday, 14 Nov', time: '02:30 PM', engineer: 'Eng. Zul' },
    { id: 3, date: 'Friday, 16 Nov', time: '11:00 AM', engineer: 'Eng. Sarah' },
  ];

  const selectedSlot = dates.find(d => d.id === selectedDate);

  const handleConfirm = () => {
    if (selectedDate) {
      setStep('success');
    }
  };

  const handleSubmitAlternative = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposedDate && proposedTime) {
      setStep('request_success');
    }
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Icons.Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Schedule Confirmed!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Maintenance for <strong>{assetInfo.name}</strong> is set for {selectedSlot?.date} at {selectedSlot?.time}.
        </p>
        
        <Card className="w-full mb-8 text-left border-sky-100 bg-sky-50/30">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Reference No.</div>
              <div className="text-lg font-black text-slate-900 uppercase">PPM-2023-4402</div>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Icons.Calendar className="w-6 h-6 text-sky-600" />
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t border-sky-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Engineer</span>
              <span className="font-bold text-slate-800">{selectedSlot?.engineer}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Estimated Duration</span>
              <span className="font-bold text-slate-800">45 Minutes</span>
            </div>
          </div>
        </Card>

        <button 
          onClick={onComplete}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (step === 'request_success') {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-6">
          <Icons.Bell className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Request Sent!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Your proposal for a new maintenance window has been sent to the Biomedical team. They will review and get back to you shortly.
        </p>
        <Card className="w-full mb-8 text-left border-slate-100 bg-slate-50">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Requested Time</div>
          <div className="text-sm font-bold text-slate-800">{proposedDate} at {proposedTime}</div>
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

  if (step === 'request_new') {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <Header title="Request Different Time" showBack onBack={() => setStep('select')} />
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          <div className="mb-6">
            <h4 className="font-bold text-slate-900">Propose Alternative Slot</h4>
            <p className="text-xs text-slate-500 mt-1">Tell us when works best for your ward. We'll try our best to accommodate.</p>
          </div>

          <form onSubmit={handleSubmitAlternative} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Proposed Date</label>
              <div className="relative">
                <Icons.Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  required
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Proposed Time</label>
              <div className="relative">
                <Icons.Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="time" 
                  required
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Reason / Comments</label>
              <textarea 
                rows={4}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="e.g. Ward busy during current slots, equipment needed for priority surgery..."
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              {/* Fix: AlertCircle does not exist on Icons, it is mapped to Breakdown */}
              <Icons.Breakdown className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-800 leading-tight">
                <strong>Note:</strong> Emergency maintenance cannot be rescheduled. Rescheduling may affect device compliance status.
              </p>
            </div>
          </form>
        </div>
        <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
          <button 
            onClick={handleSubmitAlternative}
            disabled={!proposedDate || !proposedTime}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
              proposedDate && proposedTime ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Submit Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="PPM Scheduling" showBack onBack={onCancel} />
      
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {/* Asset Header */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
              <Icons.PPM className="w-6 h-6" />
            </div>
            <StatusBadge status="Pending" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{assetInfo.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500 font-medium">ID: {assetInfo.id}</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-xs text-slate-500 font-medium">{assetInfo.location}</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-bold text-slate-900">Maintenance Request</h4>
          <p className="text-sm text-slate-500 mt-1">Biomedical Engineering has proposed the following slots for annual maintenance.</p>
        </div>

        <SectionHeader title="Select Preferred Slot" />
        <div className="space-y-3">
          {dates.map((d) => (
            <button 
              key={d.id}
              onClick={() => setSelectedDate(d.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                selectedDate === d.id 
                  ? 'border-sky-600 bg-sky-50 shadow-md shadow-sky-100' 
                  : 'border-white bg-white hover:border-slate-200'
              }`}
            >
              <div className="text-left">
                <div className={`text-sm font-bold transition-colors ${selectedDate === d.id ? 'text-sky-600' : 'text-slate-800'}`}>
                  {d.date}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Icons.Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400 font-medium">{d.time}</span>
                  <span className="mx-1 text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{d.engineer}</span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedDate === d.id ? 'border-sky-600 bg-sky-600' : 'border-slate-200'
              }`}>
                {selectedDate === d.id && <Icons.Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={() => setStep('request_new')}
          className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:text-sky-600 hover:border-sky-200 transition-colors"
        >
          None of these work? Request different time
        </button>

        <div className="mt-8 p-5 bg-white rounded-3xl border border-slate-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Icons.Report className="w-4 h-4" /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engineer's Instructions</span>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Regular annual check. Will involve software calibration and battery cycle testing. Estimated downtime: 45 minutes. Please ensure the device is not in active use during the scheduled window."
            </p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-5 text-slate-900 rotate-12">
            <Icons.PPM className="w-24 h-24" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = 'tel:0123456789'}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Icons.Phone className="w-4 h-4" />
            Contact
          </button>
          <button 
            disabled={!selectedDate}
            onClick={handleConfirm}
            className={`flex-[2] py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
              selectedDate 
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-100' 
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
