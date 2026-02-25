
import React from 'react';
import { ActionButton, Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Header } from '../components/Layout';
import { Icons } from '../constants';
import { UserRole } from '../types';

export const ExecutorDashboard: React.FC<{ 
  role: UserRole; 
  onAction: (flow: string) => void;
  unreadCount?: number;
}> = ({ role, onAction, unreadCount = 0 }) => {
  return (
    <div className="flex flex-col h-full">
      <Header 
        title={`${role} Portal`} 
        onNotificationClick={() => onAction('notifications')} 
        unreadCount={unreadCount}
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        <div className="bg-slate-900 rounded-2xl p-5 text-white mb-6 shadow-xl shadow-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-xl font-bold uppercase">{role.substring(0, 2)}</div>
            <div>
              <div className="font-bold">Ahmad Kamal</div>
              <div className="text-xs text-slate-400 font-medium">Senior {role}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <button onClick={() => onAction('task_list')} className="text-left">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Jobs Today</div>
              <div className="text-lg font-bold">4 Tasks</div>
            </button>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Rating</div>
              <div className="text-lg font-bold text-sky-400">4.9 ⭐</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ActionButton label="Pending Jobs" icon="Jobs" color="bg-white" onClick={() => onAction('task_list')} sublabel="3 New requests" />
          <ActionButton label="PPM Schedule" icon="Calendar" color="bg-white" onClick={() => onAction('ppm_list')} sublabel="8 Tasks this week" />
          {/* Fix: BIOMED removed as it is not in UserRole, BIOMEDICAL_ENGINEER covers it */}
          {role === UserRole.BIOMEDICAL_ENGINEER && (
            <>
              <ActionButton label="Replacements" icon="Replacement" color="bg-white" onClick={() => onAction('replacement_list')} sublabel="Manage loaners" />
              <ActionButton label="Device Removal" icon="Truck" color="bg-white" onClick={() => onAction('removal')} sublabel="Transport to office" />
            </>
          )}
        </div>

        <SectionHeader title="Currently Active Job" />
        <Card className="border-l-4 border-l-sky-500" onClick={() => onAction('job_detail')}>
          <div className="flex justify-between mb-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ACTIVE • REQ-1102</div>
            <StatusBadge status="In Progress" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">{role === UserRole.TOW_TRUCK ? 'Towing Ambulance WMX' : 'Oxygen Concentrator Maintenance'}</h4>
          <p className="text-[10px] text-slate-500 mt-1">Location: Hospital Seri Botani • Level 2</p>
          <div className="mt-4 flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onAction('job_detail'); }} className="flex-1 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform">Resume Job</button>
            <button className="p-2 border border-slate-200 rounded-xl text-slate-500 active:bg-slate-50"><Icons.Navigation className="w-4 h-4" /></button>
          </div>
        </Card>

        <SectionHeader title="Recent Activity" onSeeAll={() => onAction('records')} />
        <div className="space-y-3 pb-4">
          {[1, 2].map((i) => (
            <Card key={i} className="flex items-center justify-between p-3" onClick={() => onAction('records')}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Icons.Check className="w-4 h-4" /></div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Completed Repair #{i}</div>
                  <div className="text-[10px] text-slate-400">Yesterday</div>
                </div>
              </div>
              <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
