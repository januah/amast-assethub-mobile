
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Layout';
import { Stepper, Card, SectionHeader } from '../components/Shared';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface ExecutionFlowProps {
  role: UserRole;
  onComplete: () => void;
  onCancel: () => void;
  onRequestRemoval?: () => void;
  onIssueReplacement?: () => void;
  onOpenChecklist?: () => void;
}

export const ExecutionFlow: React.FC<ExecutionFlowProps> = ({ 
  role, 
  onComplete, 
  onCancel, 
  onOpenChecklist 
}) => {
  const [step, setStep] = useState(0);
  const [isReleased, setIsReleased] = useState(false);
  const steps = ['Arrival', 'Inspection', 'Action', 'Complete'];

  // Mock checklist state for UI feedback
  const checklistProgress = {
    answered: 5,
    total: 12,
    status: 'In Progress' as const
  };

  const isServiceRole = [
    UserRole.BIOMEDICAL_ENGINEER, 
    UserRole.MECHANIC, 
    UserRole.HEAD_MECHANIC
  ].includes(role);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else setIsReleased(true);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else onCancel();
  };

  if (isReleased) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-emerald-100">
          <Icons.Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Asset Released!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Maintenance for <strong>Phillips Defibrillator X3</strong> is complete.
        </p>
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
      <Header title="Job Execution" showBack onBack={back} />
      <Stepper steps={steps} current={step} />

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {step === 0 && (
          <div className="space-y-6">
            <Card className="border-sky-200 bg-sky-50/30">
              <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3">Target Asset</h4>
              <h3 className="font-bold text-slate-900 text-lg">Phillips Defibrillator X3</h3>
              <p className="text-xs text-slate-500 mb-4">ID: DF-002 • Ward 4B</p>
              
              {isServiceRole && (
                <div className="pt-4 border-t border-sky-100">
                  <div className="bg-white p-4 rounded-2xl mb-3 border border-sky-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Checklist</span>
                       <span className="text-[10px] font-black text-sky-600 uppercase">{checklistProgress.answered}/{checklistProgress.total} Tasks</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                       <div 
                         className="h-full bg-sky-600" 
                         style={{ width: `${(checklistProgress.answered / checklistProgress.total) * 100}%` }}
                       />
                    </div>
                    <button 
                      onClick={onOpenChecklist}
                      className="w-full py-3 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-sky-100"
                    >
                      <Icons.List className="w-4 h-4" />
                      Continue Checklist
                    </button>
                  </div>
                  <p className="text-[9px] text-center text-slate-400 italic uppercase font-bold tracking-tighter">Required for ISO-13485 Compliance</p>
                </div>
              )}
            </Card>

            <button onClick={next} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">Confirm Arrival & Start Job</button>
          </div>
        )}

        {step > 0 && (
          <div className="space-y-6">
            <Card className="bg-white">
               <SectionHeader title="Technical Tasks" />
               <div className="p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Icons.Clock className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">Perform manual technical tasks for step <strong>{steps[step]}</strong>.</p>
               </div>
            </Card>
            <button onClick={next} className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">Next Stage</button>
          </div>
        )}
      </div>
    </div>
  );
};
