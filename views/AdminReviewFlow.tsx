
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, StatusBadge, SectionHeader } from '../components/Shared';
import { Icons } from '../constants';

interface ReviewItem {
  id: string;
  type: 'Quotation' | 'Removal' | 'PPM Modification';
  asset: string;
  requester: string;
  date: string;
  priority: string;
  amount?: string;
  reason: string;
  details: string[];
}

interface AdminReviewFlowProps {
  requestId: string;
  onComplete: () => void;
  onBack: () => void;
}

export const AdminReviewFlow: React.FC<AdminReviewFlowProps> = ({ requestId, onComplete, onBack }) => {
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [action, setAction] = useState<'Approve' | 'Reject' | null>(null);
  const [comment, setComment] = useState('');

  // Mock data retrieval based on ID
  const item: ReviewItem = {
    id: requestId || 'REQ-1209',
    type: 'Quotation',
    asset: 'Ambulance WMX 4821',
    requester: 'Mech. Ahmad Kamal',
    date: '25 Oct 2023',
    priority: 'Urgent',
    amount: 'RM 2,500.00',
    reason: 'Engine Overhaul required after roadside breakdown on MRR2.',
    details: [
      'Gasket Set Replacement (RM 450)',
      'Piston Rings & Seals (RM 800)',
      'Machine Shop Labor (RM 600)',
      'Mechanic Service Hours (RM 650)'
    ]
  };

  const handleAction = (type: 'Approve' | 'Reject') => {
    setAction(type);
    setStep('confirm');
  };

  const submitAction = () => {
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce ${
          action === 'Approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
        }`}>
          {action === 'Approve' ? <Icons.Check className="w-10 h-10" /> : <Icons.X className="w-10 h-10" />}
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Request {action === 'Approve' ? 'Approved' : 'Rejected'}</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Decision for <strong>{item.id}</strong> has been logged. The relevant department and technician have been notified via push notification.
        </p>
        <Card className="w-full mb-8 text-left border-slate-100 bg-slate-50">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</div>
          <div className="text-sm font-black text-slate-900 uppercase">TXN-{Math.floor(Math.random()*90000)+10000}</div>
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

  if (step === 'confirm') {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <Header title="Confirm Decision" showBack onBack={() => setStep('details')} />
        <div className="flex-1 p-6 space-y-6">
          <div className={`p-6 rounded-3xl border-2 text-center ${
            action === 'Approve' ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
          }`}>
            <p className="text-sm font-medium text-slate-600 mb-1">You are about to</p>
            <h3 className={`text-2xl font-black uppercase ${
              action === 'Approve' ? 'text-emerald-600' : 'text-red-600'
            }`}>{action}</h3>
            <p className="text-xs text-slate-500 mt-2">Request {item.id} for {item.asset}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Decision Comments (Optional)</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide a reason or instructions for the team..."
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
              rows={5}
            />
          </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
           <button 
            onClick={submitAction}
            className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] ${
              action === 'Approve' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            Confirm {action}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Review Request" showBack onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.id}</span>
              <StatusBadge status="Pending" />
           </div>
           <h2 className="text-xl font-bold text-slate-900">{item.asset}</h2>
           <p className="text-xs text-slate-500 mt-1">{item.type} Review • {item.date}</p>
           {item.amount && (
             <div className="mt-4 pt-4 border-t border-slate-100">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Total</span>
               <div className="text-2xl font-black text-sky-600">{item.amount}</div>
             </div>
           )}
        </div>

        <SectionHeader title="Justification" />
        <Card>
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Icons.User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">{item.requester}</div>
                <div className="text-[10px] text-slate-400">Technical Lead</div>
              </div>
           </div>
           <p className="text-xs text-slate-600 leading-relaxed italic">"{item.reason}"</p>
        </Card>

        <SectionHeader title="Cost Breakdown" />
        <Card className="space-y-3">
          {item.details.map((detail, idx) => (
            <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
               <span className="text-slate-500">{detail.split('(')[0]}</span>
               <span className="font-bold text-slate-800">({detail.split('(')[1]}</span>
            </div>
          ))}
        </Card>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <Icons.Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-800 leading-tight">
            <strong>Policy Check:</strong> This request falls under Tier 2 maintenance. Final approval requires valid budget allocation for Q4.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <div className="flex gap-3">
           <button 
            onClick={() => handleAction('Reject')}
            className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold active:bg-red-100 transition-colors"
          >
            Reject
          </button>
          <button 
            onClick={() => handleAction('Approve')}
            className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"
          >
            Approve Request
          </button>
        </div>
      </div>
    </div>
  );
};
