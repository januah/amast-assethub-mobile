
import React from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons } from '../constants';

export const FinanceManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col h-full bg-slate-50">
    <Header title="Finance & Budget" showBack onBack={onBack} />
    <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
      <Card className="bg-slate-900 text-white p-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Budget Status</span>
        <div className="text-3xl font-black mt-1">RM 245,000.00</div>
        <div className="mt-4 bg-white/10 h-2 rounded-full overflow-hidden">
          <div className="bg-sky-500 h-full w-[65%]" />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
          <span>65% CONSUMED</span>
          <span>RM 85k REMAINING</span>
        </div>
      </Card>

      <SectionHeader title="Department Allocation" />
      <div className="space-y-3">
        {[
          { dept: 'Ambulance Fleet', spent: 'RM 82,000', color: 'bg-orange-500' },
          { dept: 'Biomedical Devices', spent: 'RM 120,000', color: 'bg-sky-500' },
          { dept: 'Emergency Unit', spent: 'RM 43,000', color: 'bg-emerald-500' },
        ].map((item, i) => (
          <Card key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${item.color}`} />
              <div>
                <div className="text-sm font-bold text-slate-800">{item.dept}</div>
                <div className="text-[10px] text-slate-400">Total YTD Spend</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-900">{item.spent}</div>
              <div className="text-[10px] text-emerald-500 font-bold">↑ 4.2% vs LY</div>
            </div>
          </Card>
        ))}
      </div>

      <SectionHeader title="Recent Transactions" />
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 border-b border-slate-50 last:border-0 flex justify-between items-center active:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Icons.Check className="w-4 h-4" /></div>
              <div>
                <div className="text-xs font-bold text-slate-800">Part Purchase #{1020 + i}</div>
                <div className="text-[10px] text-slate-400">Approved by Admin • 2h ago</div>
              </div>
            </div>
            <div className="text-xs font-black text-slate-900">RM {450 + (i * 120)}.00</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const StaffManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col h-full bg-slate-50">
    <Header title="Team Management" showBack onBack={onBack} />
    <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <div className="text-2xl font-black text-sky-600">12</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Active Staff</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-black text-emerald-600">92%</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Efficiency</div>
        </Card>
      </div>

      <SectionHeader title="Technician Performance" />
      <div className="space-y-3">
        {[
          { name: 'Ahmad Kamal', role: 'Senior BioEng', status: 'On Job', score: '4.9', tasks: '12 Completed' },
          { name: 'Zul Hasnan', role: 'Mechanic Lead', status: 'Online', score: '4.7', tasks: '8 Completed' },
          { name: 'Sarah Lee', role: 'Jr. Technician', status: 'Offline', score: '4.8', tasks: '15 Completed' },
        ].map((staff, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 relative">
              <Icons.User className="w-6 h-6" />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                staff.status === 'Online' ? 'bg-emerald-500' : staff.status === 'On Job' ? 'bg-amber-500' : 'bg-slate-300'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="text-sm font-bold text-slate-800">{staff.name}</div>
                <div className="text-[10px] font-black text-sky-600">⭐ {staff.score}</div>
              </div>
              <div className="text-[10px] text-slate-400">{staff.role} • {staff.tasks}</div>
            </div>
            <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
          </Card>
        ))}
      </div>
      
      <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-sky-600 hover:border-sky-300 transition-all">
        Add New Staff Member
      </button>
    </div>
  </div>
);

export const ReportsAnalytics: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col h-full bg-slate-50">
    <Header title="Reports & Analytics" showBack onBack={onBack} />
    <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
      <SectionHeader title="Uptime Statistics" />
      <Card className="p-6">
        <div className="flex items-end gap-2 h-40 mb-4">
          {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-sky-100 rounded-t-lg relative" style={{ height: `${h}%` }}>
                 <div className="absolute top-0 left-0 w-full bg-sky-600 rounded-t-lg transition-all duration-1000" style={{ height: '100%' }} />
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">{['M','T','W','T','F','S','S'][i]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Avg. Uptime</div>
            <div className="text-xl font-black text-slate-900">98.2%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-emerald-500 uppercase">Status</div>
            <div className="text-sm font-bold text-emerald-600">Optimized</div>
          </div>
        </div>
      </Card>

      <SectionHeader title="Downtime by Category" />
      <div className="space-y-3">
        {[
          { label: 'Wait for Parts', value: '45h', pct: 60, color: 'bg-red-500' },
          { label: 'Technical Labor', value: '20h', pct: 25, color: 'bg-amber-500' },
          { label: 'Administrative', value: '12h', pct: 15, color: 'bg-sky-500' },
        ].map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-3 pt-4">
        <button className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2">
          <Icons.Report className="w-4 h-4" /> Export Monthly PDF
        </button>
      </div>
    </div>
  </div>
);

export const AuditLogs: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col h-full bg-slate-50">
    <Header title="Audit Logs" showBack onBack={onBack} />
    <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
           <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0">
             <Icons.Clock className="w-4 h-4" />
           </div>
           <div className="flex-1 min-w-0">
             <div className="text-xs font-bold text-slate-800">Authorization Granted</div>
             <p className="text-[10px] text-slate-500 mt-0.5">Admin authorized REQ-{1200 + i} for RM {200 * i}.00</p>
             <div className="flex items-center gap-2 mt-2">
               <div className="w-4 h-4 bg-sky-100 rounded-full" />
               <span className="text-[8px] font-black text-slate-400 uppercase">Timestamp: 25 Oct 2023, 14:2{i}</span>
             </div>
           </div>
        </div>
      ))}
    </div>
  </div>
);
