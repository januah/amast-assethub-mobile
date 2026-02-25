
import React, { useState, useRef } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge, ActionButton, Stepper } from '../components/Shared';
import { Icons, REPLACEMENT_STATUS_COLORS } from '../constants';
import { UserRole, ReplacementStatus, ReplacementCase, ReplacementEvent } from '../types';

// Mock Data
const MOCK_REPLACEMENTS: ReplacementCase[] = [
  {
    id: 'RC-2026-001',
    status: 'In Use',
    serviceRequestId: 'SR-2026-00128',
    originalDeviceId: 'EQ-000231',
    originalDeviceName: 'Infusion Pump IP-2301',
    loanerDeviceId: 'LN-000045',
    loanerDeviceName: 'Infusion Pump LP-120',
    department: 'Cardiology',
    pic: 'Dr. Amina',
    issuedBy: 'Haziq',
    issuedDate: '2023-10-20 09:00',
    expectedReturn: '2023-10-30',
    timeline: [
      { id: '1', type: 'Issued', timestamp: '2023-10-20 09:00', user: 'Haziq', remarks: 'Loaner issued as original needs major board repair.' }
    ]
  },
  {
    id: 'RC-2026-002',
    status: 'Overdue',
    serviceRequestId: 'SR-2026-00130',
    originalDeviceId: 'EQ-000240',
    originalDeviceName: 'Defibrillator X3',
    loanerDeviceId: 'LN-000050',
    loanerDeviceName: 'Defibrillator Loaner A',
    department: 'Emergency',
    pic: 'Dr. Sam',
    issuedBy: 'Sarah',
    issuedDate: '2023-10-15 08:30',
    expectedReturn: '2023-10-22',
    timeline: [
      { id: '1', type: 'Issued', timestamp: '2023-10-15 08:30', user: 'Sarah' }
    ]
  }
];

export const TemporaryReplacementsList: React.FC<{ 
  role: UserRole; 
  onBack: () => void;
  onSelectCase: (id: string) => void;
  onIssueNew: () => void;
}> = ({ role, onBack, onSelectCase, onIssueNew }) => {
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
  const [search, setSearch] = useState('');

  // Fix: Map non-existent properties to correct UserRole values
  const canManage = [UserRole.ADMIN_HOSPITAL, UserRole.SUPERADMIN, UserRole.BIOMEDICAL_ENGINEER].includes(role);

  const filtered = MOCK_REPLACEMENTS.filter(c => 
    (activeTab === 'Active' ? c.status !== 'Closed' : c.status === 'Closed') &&
    (c.id.toLowerCase().includes(search.toLowerCase()) || c.originalDeviceName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Temporary Replacements" showBack onBack={onBack} />
      
      <div className="flex p-1 bg-white border-b border-slate-100">
        {(['Active', 'History'] as const).map((t) => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
              activeTab === t ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 bg-white border-b border-slate-100">
        <div className="relative">
          <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none" 
            placeholder="Search by ID, Tag, or PIC..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {filtered.length > 0 ? filtered.map((c) => (
          <Card key={c.id} onClick={() => onSelectCase(c.id)} className="border-l-4 border-l-sky-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{c.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${REPLACEMENT_STATUS_COLORS[c.status]}`}>
                {c.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Original</span>
                <span className="text-xs font-bold text-slate-800">{c.originalDeviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Loaner</span>
                <span className="text-xs font-bold text-sky-600">{c.loanerDeviceName}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Icons.Navigation className="w-3 h-3" /> {c.department} • {c.pic}
              </div>
              <div className={`text-[10px] font-bold ${c.status === 'Overdue' ? 'text-red-500' : 'text-slate-400'}`}>
                Exp: {c.expectedReturn}
              </div>
            </div>
          </Card>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icons.Replacement className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 text-sm italic">No temporary replacements found</p>
            {canManage && (
              <button 
                onClick={onIssueNew}
                className="mt-6 px-6 py-3 bg-sky-600 text-white rounded-2xl font-bold shadow-lg"
              >
                Issue Temporary Replacement
              </button>
            )}
          </div>
        )}
      </div>

      {canManage && activeTab === 'Active' && filtered.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
          <button 
            onClick={onIssueNew}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <Icons.Plus className="w-4 h-4" /> Issue Loaner
          </button>
        </div>
      )}
    </div>
  );
};

export const ReplacementCaseDetail: React.FC<{ 
  caseId: string; 
  role: UserRole; 
  onBack: () => void;
  onUpdateReturn: () => void;
  onSwap: () => void;
  onReturn: () => void;
  onClose: () => void;
  onAcknowledge: (type: 'received' | 'installed') => void;
}> = ({ caseId, role, onBack, onUpdateReturn, onSwap, onReturn, onClose, onAcknowledge }) => {
  const [currentCase, setCurrentCase] = useState<ReplacementCase>(
    MOCK_REPLACEMENTS.find(r => r.id === caseId) || MOCK_REPLACEMENTS[0]
  );
  const [ackType, setAckType] = useState<'received' | 'installed' | null>(null);
  const [remarks, setRemarks] = useState('');

  // Fix: Map non-existent properties BIOMED, ADMIN, MO to existing UserRole keys
  const isBiomed = [UserRole.ADMIN_HOSPITAL, UserRole.SUPERADMIN, UserRole.BIOMEDICAL_ENGINEER].includes(role);
  const isMO = [UserRole.MEDICAL_OFFICER].includes(role);

  const handleAcknowledge = () => {
    if (!ackType) return;
    
    const newEvent: ReplacementEvent = {
      id: Date.now().toString(),
      type: ackType === 'received' ? 'Loaner Acknowledged Received' : 'Original Device Installed/Working',
      timestamp: new Date().toLocaleString(),
      user: 'Dr. Sarah Jones',
      remarks: remarks || (ackType === 'received' ? 'Loaner received and verified working.' : 'Original device returned, installed and verified operational.')
    };

    setCurrentCase(prev => ({
      ...prev,
      timeline: [newEvent, ...prev.timeline],
      status: ackType === 'installed' ? 'Original Returned' : prev.status
    }));

    setAckType(null);
    setRemarks('');
    onAcknowledge(ackType);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <Header title="Replacement Detail" showBack onBack={onBack} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        <Card className="bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase">{currentCase.id}</span>
              <h2 className="text-lg font-bold text-slate-900">{currentCase.originalDeviceName}</h2>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${REPLACEMENT_STATUS_COLORS[currentCase.status]}`}>
              {currentCase.status}
            </span>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
               <Icons.Report className="w-5 h-5 text-slate-400" />
               <div className="flex-1">
                 <div className="text-[10px] text-slate-400 font-bold uppercase">Linked Request</div>
                 <div className="text-xs font-bold text-sky-600">{currentCase.serviceRequestId}</div>
               </div>
               <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-100 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Loaner Device</div>
                  <div className="text-xs font-bold text-slate-800">{currentCase.loanerDeviceName}</div>
                  <div className="text-[8px] text-slate-400 font-bold">{currentCase.loanerDeviceId}</div>
                </div>
                <div className="p-3 border border-slate-100 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">PIC</div>
                  <div className="text-xs font-bold text-slate-800">{currentCase.pic}</div>
                  <div className="text-[8px] text-slate-400 font-bold">{currentCase.department}</div>
                </div>
             </div>
          </div>
        </Card>

        <SectionHeader title="Case Timeline" />
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {currentCase.timeline.map((event, idx) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-sky-500 shadow-sm" />
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800">{event.type}</span>
                  <span className="text-[8px] text-slate-400">{event.timestamp}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{event.remarks || 'Standard event recorded.'}</p>
                <div className="mt-2 text-[8px] font-bold text-slate-400 uppercase">By {event.user}</div>
              </div>
            </div>
          ))}
        </div>

        {role === UserRole.VIEWER && (
          <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-3 border border-slate-200">
            <Icons.Info className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 italic">Read-only view enabled.</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        {isBiomed && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button 
                onClick={onUpdateReturn}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold active:bg-slate-50"
              >
                Update Return
              </button>
              <button 
                onClick={onSwap}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold active:bg-slate-50"
              >
                Swap Loaner
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onReturn}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                Return Loaner
              </button>
              <button 
                onClick={onClose}
                disabled={currentCase.status !== 'Loaner Returned'}
                className={`flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg ${currentCase.status !== 'Loaner Returned' && 'opacity-50'}`}
              >
                Close Case
              </button>
            </div>
          </div>
        )}

        {isMO && (
          <div className="space-y-2">
            <button 
              onClick={() => setAckType('received')}
              className="w-full py-3 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-transform"
            >
              Acknowledge Receipt
            </button>
            <button 
              onClick={() => setAckType('installed')}
              className="w-full py-3 bg-white border border-sky-600 text-sky-600 rounded-xl text-xs font-bold active:scale-95 transition-transform"
            >
              Acknowledge Original Installed
            </button>
          </div>
        )}
      </div>

      {/* Acknowledgment Modal */}
      {ackType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAckType(null)} />
          <div className="relative w-full bg-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
                <Icons.Check className="w-8 h-8" />
              </div>
              <button onClick={() => setAckType(null)} className="p-2 text-slate-400">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {ackType === 'received' ? 'Acknowledge Receipt' : 'Original Device Ready'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {ackType === 'received' 
                ? "Confirm that the loaner device has been received, is in good condition, and is currently functional in your department."
                : "Confirm that the original device has been returned, installed, and is verified working as intended."}
            </p>

            <div className="space-y-1 mb-6">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Optional Remarks</label>
              <textarea 
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Loaner received without carrying case..."
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                rows={3}
              />
            </div>

            <button 
              onClick={handleAcknowledge}
              className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Confirm Acknowledgment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const IssueReplacementWizard: React.FC<{ onComplete: () => void; onCancel: () => void }> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const steps = ['Context', 'Select Loaner', 'Issue To'];

  const [formData, setFormData] = useState({
    srId: 'SR-2026-00128',
    original: 'Infusion Pump IP-2301',
    reason: 'Repair Delay',
    loanerType: 'From Pool',
    loanerId: '',
    dept: 'Cardiology',
    pic: 'Dr. Amina',
    returnDate: ''
  });

  const next = () => step < 2 ? setStep(step + 1) : onComplete();
  const back = () => step > 0 ? setStep(step - 1) : onCancel();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Issue Loaner" showBack onBack={back} />
      <Stepper steps={steps} current={step} />

      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        {step === 0 && (
          <div className="space-y-4">
            <SectionHeader title="Service Context" />
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Service Request ID</label>
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600">{formData.srId}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Original Device</label>
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600">{formData.original}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Reason for Replacement</label>
                <select 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                >
                  <option>Repair delay</option>
                  <option>Sent to workshop</option>
                  <option>Parts pending</option>
                  <option>Safety</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Notes</label>
                <textarea 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none" 
                  rows={3}
                  placeholder="Additional context..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <SectionHeader title="Loaner Selection" />
            <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-100">
              <button 
                onClick={() => setFormData({...formData, loanerType: 'From Pool'})}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${formData.loanerType === 'From Pool' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
              >
                FROM POOL
              </button>
              <button 
                onClick={() => setFormData({...formData, loanerType: 'External'})}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${formData.loanerType === 'External' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
              >
                EXTERNAL
              </button>
            </div>

            {formData.loanerType === 'From Pool' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none" placeholder="Search available loaners..." />
                </div>
                {['Infusion Pump LP-120 (LN-000045)', 'Infusion Pump LP-121 (LN-000046)'].map(id => (
                  <Card 
                    key={id} 
                    onClick={() => setFormData({...formData, loanerId: id})}
                    className={`border-2 transition-all ${formData.loanerId === id ? 'border-sky-500 bg-sky-50' : 'border-slate-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">{id}</span>
                      <Icons.Check className={`w-4 h-4 ${formData.loanerId === id ? 'text-sky-600' : 'text-slate-200'}`} />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <input className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none" placeholder="Supplier Name" />
                <input className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none" placeholder="Model Name" />
                <input className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none" placeholder="Serial / Tag" />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <SectionHeader title="Assignment Details" />
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Department</label>
                <input 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none" 
                  value={formData.dept}
                  onChange={e => setFormData({...formData, dept: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">PIC (Medical Officer)</label>
                <input 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none" 
                  value={formData.pic}
                  onChange={e => setFormData({...formData, pic: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Expected Return Date</label>
                <input 
                  type="date"
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none" 
                  value={formData.returnDate}
                  onChange={e => setFormData({...formData, returnDate: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                <input type="checkbox" id="verify" className="w-5 h-5 rounded-md border-sky-200" />
                <label htmlFor="verify" className="text-xs font-bold text-sky-800 uppercase">Loaner verified working</label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <button 
          onClick={next}
          className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg"
        >
          {step === 2 ? 'Issue Loaner' : 'Continue'}
        </button>
      </div>
    </div>
  );
};
