
import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons, INSTALL_STATUS_COLORS } from '../constants';
import { 
  InstallationService, 
  InstallationStatus, 
  ChecklistSection, 
  Questionnaire, 
  ExternalSigner,
  SignerType
} from '../types';

const MOCK_CHECKLIST: ChecklistSection[] = [
  {
    id: 'SEC-01',
    title: 'Site Preparation & Delivery',
    questionnaires: [
      {
        id: 'Q1',
        text: 'Equipment delivered without external damage',
        responseType: 'yesno',
        required: true,
        evidenceRequired: true,
        notesAllowed: true,
        answer: { value: null, photos: [] }
      },
      {
        id: 'Q2',
        text: 'Installation site matches environmental requirements',
        helpText: 'Humidity, power phase, and spatial clearance.',
        responseType: 'passfail',
        required: true,
        evidenceRequired: true,
        notesAllowed: true,
        answer: { value: null, photos: [] }
      }
    ]
  },
  {
    id: 'SEC-02',
    title: 'Testing & Commissioning',
    questionnaires: [
      {
        id: 'Q3',
        text: 'Ground resistance reading',
        responseType: 'numeric',
        required: true,
        evidenceRequired: false,
        notesAllowed: false,
        config: { min: 0, max: 0.5, unit: 'Ω' },
        answer: { value: '' }
      },
      {
        id: 'Q4',
        text: 'User acceptance training completed',
        responseType: 'yesno',
        required: true,
        evidenceRequired: true,
        notesAllowed: true,
        answer: { value: null, photos: [] }
      }
    ]
  }
];

export const InstallationFlow: React.FC<{ serviceId: string; onBack: () => void }> = ({ serviceId, onBack }) => {
  const [view, setView] = useState<'summary' | 'checklist' | 'signoffs'>('summary');
  const [status, setStatus] = useState<InstallationStatus>('assigned');
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [inviting, setInviting] = useState<SignerType | null>(null);

  useEffect(() => {
    // Simulate API Load
    const timer = setTimeout(() => {
      setSections(MOCK_CHECKLIST);
      if (serviceId === 'INS-002') setStatus('in_progress');
      if (serviceId === 'INS-003') setStatus('pending_ack');
    }, 500);
    return () => clearTimeout(timer);
  }, [serviceId]);

  const handleStart = () => {
    setStatus('in_progress');
    setView('checklist');
  };

  const handleChecklistUpdate = (secId: string, qId: string, update: any) => {
    setSyncing(true);
    setSections(prev => prev.map(s => s.id === secId ? {
      ...s,
      questionnaires: s.questionnaires.map(q => q.id === qId ? {
        ...q,
        answer: { ...q.answer, ...update }
      } : q)
    } : s));
    setTimeout(() => setSyncing(false), 800);
  };

  const handleFinishChecklist = () => {
    setStatus('pending_ack');
    setView('signoffs');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <Header title="Installation Detail" showBack onBack={onBack} />

      {/* Persistent Status Strip */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {status.replace('_', ' ')}
            </span>
         </div>
         <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {(['summary', 'checklist', 'signoffs'] as const).map(v => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${
                  view === v ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                {v}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar pb-24">
        {view === 'summary' && (
          <div className="space-y-6">
            <Card className="bg-slate-900 border-none text-white p-6 shadow-xl">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Commissioning</span>
               <h2 className="text-xl font-black mt-1">GE MRI Magnetom</h2>
               <p className="text-xs text-slate-400 mt-0.5">Tag: TAG-1002 • SN: 44901-X</p>
               
               <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Hospital</div>
                    <div className="text-xs font-bold">Pantai Hospital KL</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Vendor</div>
                    <div className="text-xs font-bold">GE Healthcare</div>
                  </div>
               </div>
            </Card>

            <SectionHeader title="System Information" />
            <Card className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Doc Ref</span>
                  <span className="text-xs font-bold text-slate-800">SR-INSTALL-2023-440</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Installation Site</span>
                  <span className="text-xs font-bold text-slate-800">Radiology Wing, L2</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Commissioning By</span>
                  <span className="text-xs font-bold text-slate-800">Ahmad Kamal</span>
               </div>
            </Card>

            {status === 'assigned' && (
              <button 
                onClick={handleStart}
                className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-600/20 active:scale-[0.98] transition-all"
              >
                Start Installation
              </button>
            )}
          </div>
        )}

        {view === 'checklist' && (
          <div className="space-y-6">
            {sections.map(sec => (
              <div key={sec.id} className="space-y-3">
                 <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{sec.title}</h4>
                    <span className="text-[9px] font-bold text-slate-400">
                      {sec.questionnaires.filter(q => q.answer.value).length}/{sec.questionnaires.length} Done
                    </span>
                 </div>
                 {sec.questionnaires.map(q => (
                   <InstallQuestionCard 
                     key={q.id} 
                     question={q} 
                     disabled={status !== 'in_progress'}
                     onUpdate={(upd) => handleChecklistUpdate(sec.id, q.id, upd)} 
                   />
                 ))}
              </div>
            ))}
            
            {status === 'in_progress' && (
              <button 
                onClick={handleFinishChecklist}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold mt-8 flex items-center justify-center gap-2"
              >
                Submit for Acknowledgement <Icons.ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {view === 'signoffs' && (
          <div className="space-y-4">
             <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 mb-2">
                <Icons.Info className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-800 font-medium leading-tight">
                  Three external sign-offs are required. Once all are signed, the case will be forwarded to the <strong>Hospital Director</strong> for final approval.
                </p>
             </div>

             <SignerCard 
               title="Asset Manager" 
               type="asset_manager" 
               status={status === 'pending_ack' ? 'pending' : 'signed'} 
               onInvite={(t) => setInviting(t)}
             />
             <SignerCard 
               title="End User (Department Head)" 
               type="end_user" 
               status="pending" 
               onInvite={(t) => setInviting(t)}
             />
             <SignerCard 
               title="Finance Manager" 
               type="finance_manager" 
               status="pending" 
               onInvite={(t) => setInviting(t)}
             />
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setInviting(null)} />
          <div className="relative w-full bg-white rounded-t-[40px] p-8 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
             <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-8" />
             <h3 className="text-xl font-bold text-slate-900 mb-2">Invite External Signer</h3>
             <p className="text-sm text-slate-500 mb-8 uppercase font-bold tracking-widest text-[10px]">{inviting.replace('_', ' ')}</p>
             
             <div className="space-y-4 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signer Name</label>
                  <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none outline-none focus:ring-1 focus:ring-sky-500" placeholder="e.g. Dr. Hisham" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact (WhatsApp/Email)</label>
                  <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none outline-none focus:ring-1 focus:ring-sky-500" placeholder="+60 12-XXXXXXX" />
                </div>
             </div>

             <button 
               onClick={() => setInviting(null)}
               className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-600/20"
             >
               Send Invite Link
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InstallQuestionCard: React.FC<{
  question: Questionnaire;
  disabled: boolean;
  onUpdate: (upd: any) => void;
}> = ({ question, disabled, onUpdate }) => {
  return (
    <Card className={`p-5 space-y-5 ${disabled ? 'opacity-80 bg-slate-50' : 'bg-white shadow-sm border border-slate-100'}`}>
      <div>
        <h5 className="text-sm font-bold text-slate-800 leading-tight">
          {question.text} {question.required && <span className="text-red-500 font-black">*</span>}
        </h5>
        {question.helpText && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{question.helpText}</p>}
      </div>

      <div className="flex flex-col gap-4">
        {/* Simple Input Switch Logic */}
        {question.responseType === 'yesno' && (
          <div className="flex gap-2">
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                disabled={disabled}
                onClick={() => onUpdate({ value: opt })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  question.answer.value === opt ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-100' : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {question.responseType === 'numeric' && (
          <div className="relative">
             <input 
               type="number"
               disabled={disabled}
               value={question.answer.value || ''}
               onChange={(e) => onUpdate({ value: e.target.value })}
               className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-black outline-none border-2 border-transparent focus:border-sky-500"
               placeholder="Enter reading..."
             />
             {question.config?.unit && (
               <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300 uppercase">{question.config.unit}</span>
             )}
          </div>
        )}

        {/* Multi-Photo Grid */}
        <div className="space-y-2">
           <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Evidence Photos {question.evidenceRequired && <span className="text-red-500 font-bold">*</span>}
              </span>
              <span className="text-[8px] font-bold text-slate-300 uppercase">Max 5</span>
           </div>
           <div className="grid grid-cols-4 gap-2">
              {question.answer.photos?.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                   <img src={p.url} className="w-full h-full object-cover" alt="Evidence" />
                   <div className="absolute inset-0 bg-black/20" />
                   {p.status === 'uploading' && <Icons.Clock className="absolute center-0 w-4 h-4 text-white animate-spin" />}
                </div>
              ))}
              {!disabled && (
                <button className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 active:bg-slate-50">
                   <Icons.Camera className="w-5 h-5" />
                </button>
              )}
           </div>
        </div>
      </div>
    </Card>
  );
};

const SignerCard: React.FC<{
  title: string;
  type: SignerType;
  status: 'pending' | 'signed' | 'declined';
  onInvite?: (type: SignerType) => void;
  readOnly?: boolean;
}> = ({ title, type, status, onInvite, readOnly }) => {
  return (
    <Card className="flex items-center gap-4 p-5">
       <div className={`p-3 rounded-2xl ${status === 'signed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
          <Icons.Pen className="w-5 h-5" />
       </div>
       <div className="flex-1">
          <div className="flex justify-between items-start">
             <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{title}</h4>
             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${status === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {status}
             </span>
          </div>
          {status === 'signed' ? (
            <p className="text-[9px] text-slate-500 mt-1 font-medium">Digital signature recorded on 2023-10-25</p>
          ) : (
            <p className="text-[9px] text-slate-400 mt-1 italic font-medium">Invitation not yet sent</p>
          )}
       </div>
       {!readOnly && status !== 'signed' && (
         <button 
           onClick={() => onInvite?.(type)}
           className="p-2.5 bg-sky-50 text-sky-600 rounded-xl active:bg-sky-100 transition-colors"
         >
           <Icons.Invite className="w-4 h-4" />
         </button>
       )}
    </Card>
  );
};
