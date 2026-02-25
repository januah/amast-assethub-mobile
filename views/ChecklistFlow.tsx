
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons } from '../constants';
import { ChecklistRun, ChecklistSection, Questionnaire, ChecklistResponseType } from '../types';

const MOCK_RUN: ChecklistRun = {
  id: 'RUN-44901',
  status: 'In Progress',
  template: { id: 'T-88', name: 'Advanced Defibrillator PM', version: '2.4.1' },
  equipment: { id: 'EQ-002', name: 'Phillips X3 Monitor', model: 'X3-Pro', serial: 'SN-99201-B' },
  performedBy: 'Ahmad Kamal',
  startedAt: '2023-10-25 09:00',
  sections: [
    {
      id: 'S1',
      title: 'Visual Inspection',
      instructionNotes: 'Ensure the device is disconnected from mains before inspection.',
      questionnaires: [
        {
          id: 'Q1',
          text: 'External casing integrity',
          helpText: 'Check for cracks, fluid ingress, or loose screws.',
          responseType: 'passfail',
          required: true,
          evidenceRequired: false,
          notesAllowed: true,
          answer: { value: null }
        },
        {
          id: 'Q2',
          text: 'Labels and markings legible',
          responseType: 'yesno',
          required: true,
          evidenceRequired: true,
          notesAllowed: true,
          answer: { value: null, photos: [] }
        }
      ]
    },
    {
      id: 'S2',
      title: 'Electrical Safety',
      questionnaires: [
        {
          id: 'Q3',
          text: 'Chassis Leakage Current',
          responseType: 'numeric' as any,
          required: true,
          evidenceRequired: false,
          notesAllowed: true,
          config: { min: 0, max: 100, unit: 'µA' },
          answer: { value: '' }
        },
        {
          id: 'Q4',
          text: 'Ground Resistance',
          responseType: 'numeric' as any,
          required: true,
          evidenceRequired: false,
          notesAllowed: false,
          config: { min: 0.1, max: 0.5, unit: 'Ω' },
          answer: { value: '' }
        }
      ]
    },
    {
      id: 'S3',
      title: 'Operational Tests',
      questionnaires: [
        {
          id: 'Q5',
          text: 'Self-test diagnostic outcome',
          responseType: 'single_choice',
          required: true,
          evidenceRequired: false,
          notesAllowed: true,
          config: {
            choices: [
              { value: 'pass', label: 'All Passed' },
              { value: 'fail_minor', label: 'Minor Failure' },
              { value: 'fail_critical', label: 'Critical Failure' }
            ]
          },
          answer: { value: null }
        },
        {
          id: 'Q6',
          text: 'Optional accessories present',
          responseType: 'multiple_choice',
          required: false,
          evidenceRequired: false,
          notesAllowed: true,
          config: {
            choices: [
              { value: 'ecg', label: 'ECG Cable' },
              { value: 'nibp', label: 'NIBP Cuff' },
              { value: 'spo2', label: 'SpO2 Probe' }
            ]
          },
          answer: { value: [] }
        },
        {
          id: 'Q7',
          text: 'Last battery replacement date',
          responseType: 'date',
          required: true,
          evidenceRequired: false,
          notesAllowed: false,
          answer: { value: '' }
        }
      ]
    }
  ]
};

export const ChecklistRunScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [run, setRun] = useState<ChecklistRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSectionId, setOpenSectionId] = useState<string | null>('S1');
  const [syncing, setSyncing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // API Call Simulation
    setTimeout(() => {
      setRun(MOCK_RUN);
      setLoading(false);
    }, 1200);
  }, []);

  const progress = useMemo(() => {
    if (!run) return { answered: 0, total: 0, requiredAnswered: 0, requiredTotal: 0 };
    let answered = 0, total = 0, reqAns = 0, reqTot = 0;
    run.sections.forEach(s => {
      s.questionnaires.forEach(q => {
        total++;
        if (q.required) reqTot++;
        const hasValue = q.answer.value !== null && q.answer.value !== '' && (Array.isArray(q.answer.value) ? q.answer.value.length > 0 : true);
        if (hasValue || q.answer.isNA) {
          answered++;
          if (q.required) reqAns++;
        }
      });
    });
    return { answered, total, requiredAnswered: reqAns, requiredTotal: reqTot };
  }, [run]);

  const handleUpdate = (sectionId: string, questionId: string, update: Partial<any>) => {
    if (!run) return;
    setSyncing(true);
    setRun(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? {
          ...s,
          questionnaires: s.questionnaires.map(q => q.id === questionId ? {
            ...q,
            answer: { ...q.answer, ...update }
          } : q)
        } : s)
      };
    });
    setTimeout(() => setSyncing(false), 800);
  };

  const handleComplete = () => {
    if (progress.requiredAnswered < progress.requiredTotal) {
      setShowValidation(true);
    } else {
      setRun(prev => prev ? { ...prev, status: 'Completed', completedAt: new Date().toLocaleString() } : null);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center bg-white p-8">
      <Icons.PPM className="w-16 h-16 text-sky-600 animate-spin mb-6" />
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Building Checklist</h3>
      <p className="text-xs text-slate-400 mt-2">Connecting to Biomedical Registry...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-full items-center justify-center bg-white p-10 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
        <Icons.X className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Checklist Not Available</h2>
      <p className="text-sm text-slate-500 leading-relaxed">
        This equipment model (<strong>{run?.equipment.model}</strong>) has no template mapping.
        Please contact Hospital Administration.
      </p>
      <button onClick={onBack} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold">Back to Job</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <Header 
        title={run?.status === 'Completed' ? 'Service Report' : 'Digital Checklist'} 
        showBack 
        onBack={onBack} 
      />

      {/* Progress Subheader */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</span>
            <span className="text-[10px] font-black text-sky-600 uppercase">{progress.answered}/{progress.total}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-600 transition-all duration-500" 
              style={{ width: `${(progress.answered / progress.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="ml-6 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{syncing ? 'Syncing' : 'Secure'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar pb-32">
        {/* Equipment Context */}
        <Card className="bg-slate-900 border-none text-white p-5">
           <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Asset Target</div>
                <h3 className="font-bold text-base leading-tight">{run?.equipment.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">SN: {run?.equipment.serial} • Mod: {run?.equipment.model}</p>
              </div>
              <StatusBadge status={run?.status === 'Completed' ? 'Completed' : 'In Progress'} />
           </div>
           <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Template</div>
                <div className="text-[10px] font-bold">{run?.template.name} V{run?.template.version}</div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Engineer</div>
                <div className="text-[10px] font-bold">{run?.performedBy}</div>
              </div>
           </div>
        </Card>

        {/* Dynamic Sections */}
        {run?.sections.map(section => (
          <SectionAccordion 
            key={section.id}
            section={section}
            isOpen={openSectionId === section.id}
            onToggle={() => setOpenSectionId(openSectionId === section.id ? null : section.id)}
            onUpdate={(qid, val) => handleUpdate(section.id, qid, val)}
            readOnly={run.status === 'Completed'}
          />
        ))}

        {run?.status === 'Completed' && (
           <div className="p-10 border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-3xl text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
                <Icons.Check className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Digital Audit Logged</h4>
              <p className="text-[10px] text-emerald-600 mt-1 font-bold">Authenticated on {run.completedAt}</p>
           </div>
        )}
      </div>

      {/* Persistent Action Bar */}
      {run?.status === 'In Progress' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 safe-bottom">
           <button 
             onClick={handleComplete}
             className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-xl shadow-sky-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
           >
             {progress.requiredAnswered < progress.requiredTotal ? 'Review Required Items' : 'Complete & Certify'}
             <Icons.Check className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Validation Summary Modal */}
      {showValidation && run && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowValidation(false)} />
           <div className="relative w-full bg-white rounded-t-[40px] p-8 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-8" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Incomplete Tasks</h3>
              <p className="text-sm text-slate-500 text-center mb-8">Please address these required items before submitting.</p>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-8 hide-scrollbar">
                {run.sections.map(s => {
                  const missing = s.questionnaires.filter(q => q.required && (q.answer.value === null || q.answer.value === ''));
                  if (missing.length === 0) return null;
                  return (
                    <div key={s.id} className="space-y-2">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{s.title}</div>
                      {missing.map(q => (
                        <button 
                          key={q.id}
                          onClick={() => { setOpenSectionId(s.id); setShowValidation(false); }}
                          className="w-full p-4 bg-red-50 text-red-700 rounded-2xl text-left text-xs font-bold border border-red-100 active:scale-[0.98] transition-all"
                        >
                          {q.text}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setShowValidation(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
              >
                Go Back to Checklist
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const SectionAccordion: React.FC<{
  section: ChecklistSection;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (qid: string, val: Partial<any>) => void;
  readOnly: boolean;
}> = ({ section, isOpen, onToggle, onUpdate, readOnly }) => {
  const ansCount = section.questionnaires.filter(q => q.answer.value !== null && q.answer.value !== '' && (!Array.isArray(q.answer.value) || q.answer.value.length > 0)).length;
  const total = section.questionnaires.length;

  return (
    <div className="space-y-3">
      <button 
        onClick={onToggle}
        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
          isOpen ? 'bg-white shadow-sm border border-slate-200' : 'bg-slate-100 hover:bg-slate-200'
        }`}
      >
        <div className="flex flex-col items-start">
          <h4 className="font-bold text-sm text-slate-800">{section.title}</h4>
          <span className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-widest">
            {ansCount}/{total} Tasks Completed
          </span>
        </div>
        <Icons.ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90 text-sky-600' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {section.instructionNotes && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <Icons.Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800 leading-tight italic">{section.instructionNotes}</p>
            </div>
          )}
          {section.questionnaires.map(q => (
            <QuestionnaireCard 
              key={q.id} 
              question={q} 
              onUpdate={(val) => onUpdate(q.id, val)}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const QuestionnaireCard: React.FC<{
  question: Questionnaire;
  onUpdate: (val: any) => void;
  readOnly: boolean;
}> = ({ question, onUpdate, readOnly }) => {
  const [showMeta, setShowMeta] = useState(false);

  return (
    <Card className={`p-5 space-y-5 transition-opacity ${readOnly ? 'opacity-90' : 'bg-white'}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h5 className="text-sm font-bold text-slate-800 leading-tight flex-1">
            {question.text} {question.required && <span className="text-red-500 font-black">*</span>}
          </h5>
          {question.answer.isNA && <StatusBadge status="Rejected" />}
        </div>
        {question.helpText && <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{question.helpText}</p>}
      </div>

      {!question.answer.isNA ? (
        <div className="flex flex-col gap-4">
          <ChecklistInputRenderer 
            type={question.responseType} 
            value={question.answer.value} 
            onChange={(val) => onUpdate({ value: val })}
            config={question.config}
            disabled={readOnly}
          />

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMeta(!showMeta)}
              className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                (question.answer.notes || (question.answer.photos && question.answer.photos.length > 0)) 
                  ? 'border-sky-200 bg-sky-50 text-sky-600' 
                  : 'border-slate-100 text-slate-400'
              }`}
            >
              <Icons.Report className="w-3.5 h-3.5" /> {showMeta ? 'Hide Details' : 'Evidence / Notes'}
            </button>
            <button 
              disabled={readOnly}
              onClick={() => onUpdate({ isNA: true, value: null })}
              className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-400 transition-colors"
            >
              Not Applicable
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
           <div className="text-[10px] font-bold text-slate-400 uppercase">Marked as N/A</div>
           <button 
             disabled={readOnly}
             onClick={() => onUpdate({ isNA: false })}
             className="text-[10px] font-black text-sky-600 uppercase"
           >
             Undo
           </button>
        </div>
      )}

      {showMeta && !question.answer.isNA && (
        <div className="space-y-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2">
          {question.notesAllowed && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Technician Notes</label>
              <textarea 
                disabled={readOnly}
                value={question.answer.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                className="w-full p-3 bg-slate-50 rounded-xl text-xs border-none outline-none focus:ring-1 focus:ring-sky-500 min-h-[60px]"
                placeholder="Observation details..."
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              Visual Evidence {question.evidenceRequired && <span className="text-red-500 font-bold">(REQUIRED)</span>}
            </label>
            <div className="flex flex-wrap gap-2">
               {question.answer.photos?.map((p, i) => (
                 <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={p} className="w-full h-full object-cover" />
                    {!readOnly && (
                      <button 
                        onClick={() => onUpdate({ photos: question.answer.photos?.filter((_, idx) => idx !== i) })}
                        className="absolute top-0 right-0 p-1 bg-white/80 text-red-500"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    )}
                 </div>
               ))}
               {!readOnly && (
                 <button className="w-16 h-16 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 active:bg-slate-200 transition-colors">
                    <Icons.Plus className="w-5 h-5 mb-1" />
                    <span className="text-[7px] font-black">PHOTO</span>
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const ChecklistInputRenderer: React.FC<{
  type: ChecklistResponseType;
  value: any;
  onChange: (val: any) => void;
  config?: any;
  disabled: boolean;
}> = ({ type, value, onChange, config, disabled }) => {
  switch (type) {
    case 'yesno':
      return (
        <div className="flex gap-2">
          {['Yes', 'No'].map(opt => (
            <button
              key={opt}
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                value === opt ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-100' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case 'passfail':
      return (
        <div className="flex gap-2">
          {['Pass', 'Fail'].map(opt => (
            <button
              key={opt}
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                value === opt 
                  ? (opt === 'Pass' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-red-500 border-red-500 text-white')
                  : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case 'numeric':
      const isInvalid = value && ((config?.min !== undefined && value < config.min) || (config?.max !== undefined && value > config.max));
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input 
                type="number"
                disabled={disabled}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full p-4 bg-slate-50 rounded-2xl font-black text-sm border-2 outline-none transition-all ${
                  isInvalid ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-50 focus:border-sky-500 focus:bg-white'
                }`}
                placeholder="Enter reading..."
              />
              {config?.unit && <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300 uppercase">{config.unit}</span>}
            </div>
          </div>
          {config?.min !== undefined && (
             <div className="flex justify-between px-2">
                <span className={`text-[9px] font-bold ${isInvalid ? 'text-red-500' : 'text-slate-400'}`}>
                  Limits: {config.min}{config.unit} - {config.max}{config.unit}
                </span>
             </div>
          )}
        </div>
      );
    case 'single_choice':
      return (
        <div className="grid grid-cols-1 gap-2">
          {config?.choices?.map((c: any) => (
            <button
              key={c.value}
              disabled={disabled}
              onClick={() => onChange(c.value)}
              className={`w-full p-4 text-left rounded-2xl border-2 text-xs font-bold transition-all flex items-center justify-between ${
                value === c.value ? 'border-sky-500 bg-sky-50 text-sky-600 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
              }`}
            >
              {c.label}
              {value === c.value && <Icons.Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      );
    case 'multiple_choice':
      return (
        <div className="flex flex-wrap gap-2">
           {config?.choices?.map((c: any) => {
             const active = value?.includes(c.value);
             return (
               <button
                 key={c.value}
                 disabled={disabled}
                 onClick={() => {
                   const newVal = active ? value.filter((v: any) => v !== c.value) : [...(value || []), c.value];
                   onChange(newVal);
                 }}
                 className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase border-2 transition-all ${
                   active ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                 }`}
               >
                 {c.label}
               </button>
             );
           })}
        </div>
      );
    case 'date':
      return (
        <div className="relative">
          <Icons.Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="date"
            disabled={disabled}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-all"
          />
        </div>
      );
    case 'text':
      return (
        <textarea 
          disabled={disabled}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-all resize-none"
          placeholder="Technical comments..."
        />
      );
    default:
      return <div className="p-4 bg-red-50 text-red-500 text-[10px] font-bold rounded-xl">UNKNOWN TYPE: {type}</div>;
  }
};
