
import React from 'react';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Header } from '../components/Layout';
import { Icons } from '../constants';

export const ApproverDashboard: React.FC<{ onAction: (flow: string) => void }> = ({ onAction }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Hospital Approver" onNotificationClick={() => onAction('notifications')} />
      
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Check className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">General Hospital KL</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Pending Actions</h2>
          <p className="text-sm text-slate-500">You have items requiring authorization</p>
        </div>

        {/* Approval KPI */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pending Approvals</p>
              <div className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[8px] font-black uppercase">Requires Action</div>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black">14 Requests</h3>
              <button 
                onClick={() => onAction('admin_approval_list')}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-sky-600/20"
              >
                Review All
              </button>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-10 text-white pointer-events-none">
            <Icons.Check className="w-40 h-40" />
          </div>
        </div>

        <SectionHeader title="Priority Review" onSeeAll={() => onAction('admin_approval_list')} />
        <div className="space-y-4 mb-8">
          {[
            { id: 'REQ-1209', asset: 'Ambulance WMX 4821', desc: 'Engine Overhaul Quotation', cost: 'RM 2,500.00', priority: 'Critical' },
            { id: 'REQ-1208', asset: 'Phillips X3 Monitor', desc: 'Mainboard Replacement', cost: 'RM 1,200.00', priority: 'Urgent' },
          ].map((req) => (
            <Card key={req.id} className="active:scale-[0.98] transition-transform border-l-4 border-l-red-500" onClick={() => onAction('admin_review')}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{req.id} • {req.priority}</span>
                <StatusBadge status="Pending" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{req.asset}</h4>
              <p className="text-[10px] text-slate-500 mt-1">{req.desc}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-sm font-black text-red-600">{req.cost}</div>
                <div className="text-sky-600 text-[10px] font-bold flex items-center gap-1 uppercase">
                   Review <Icons.ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <SectionHeader title="Approval History" onSeeAll={() => onAction('records')} />
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {[1, 2].map(i => (
            <div key={i} className="p-4 border-b border-slate-50 last:border-0 flex justify-between items-center active:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Icons.Check className="w-4 h-4" /></div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Approved REQ-{1020 + i}</div>
                  <div className="text-[10px] text-slate-400">Yesterday • Medical Device Repair</div>
                </div>
              </div>
              <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
