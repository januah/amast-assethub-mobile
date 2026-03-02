
import React from 'react';
import { ActionButton, Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Header } from '../components/Layout';
import { Icons } from '../constants';

export const RequesterDashboard: React.FC<{ 
  onAction: (flow: string) => void,
  unreadCount?: number 
}> = ({ onAction, unreadCount = 0 }) => {
  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Dashboard" 
        onNotificationClick={() => onAction('notifications')} 
        unreadCount={unreadCount}
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Hello, Dr. Sarah 👋</h2>
          <p className="text-sm text-slate-500">General Hospital, Ward 4B</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <ActionButton 
            label="Report Breakdown" 
            icon="Breakdown" 
            sublabel="Device malfunctioning" 
            onClick={() => onAction('breakdown_flow')}
          />
          <ActionButton 
            label="Replacements" 
            icon="Replacement" 
            sublabel="Active loaner devices" 
            onClick={() => onAction('replacement_list')}
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <button onClick={() => onAction('assets')} className="bg-sky-50 p-3 rounded-2xl border border-sky-100 text-left active:scale-95 transition-transform">
            <div className="text-sky-600 font-bold text-lg leading-none">12</div>
            <div className="text-[10px] font-medium text-sky-800 mt-1 uppercase tracking-wider">Total Assets</div>
          </button>
          <button onClick={() => onAction('records')} className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-left active:scale-95 transition-transform">
            <div className="text-amber-600 font-bold text-lg leading-none">3</div>
            <div className="text-[10px] font-medium text-amber-800 mt-1 uppercase tracking-wider">Active Jobs</div>
          </button>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <div className="text-emerald-600 font-bold text-lg leading-none">95%</div>
            <div className="text-[10px] font-medium text-emerald-800 mt-1 uppercase tracking-wider">Uptime</div>
          </div>
        </div>

        {/* Recent Requests */}
        <SectionHeader title="Recent Requests" onSeeAll={() => onAction('records')} />
        <div className="space-y-3">
          {[
            { id: 'REQ-0982', asset: 'Defibrillator Phillips X3', status: 'In Progress', date: '24 Oct 2023' },
            { id: 'REQ-0975', asset: 'Vital Signs Monitor B40', status: 'Pending', date: '23 Oct 2023' },
            { id: 'REQ-0961', asset: 'Ventilator Hamilton-C6', status: 'Completed', date: '21 Oct 2023' },
          ].map((req) => (
            <Card key={req.id} className="flex flex-col gap-2" onClick={() => onAction('records')}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{req.id}</div>
                  <div className="font-bold text-sm text-slate-800">{req.asset}</div>
                </div>
                <StatusBadge status={req.status as any} />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Icons.Clock className="w-3 h-3" />
                <span>Requested on {req.date}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* What's New */}
        <SectionHeader title="What's New" />
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-4 text-white mb-4">
          <div className="flex items-start justify-between">
            <div className="max-w-[70%]">
              <h4 className="font-bold text-sm mb-1">New PPM Schedule for 2024</h4>
              <p className="text-[10px] text-sky-100 opacity-90">View the updated maintenance cycles for all medical devices in Ward 4B.</p>
              <button onClick={() => onAction('ppm_list')} className="mt-3 px-3 py-1.5 bg-white text-sky-600 rounded-lg text-[10px] font-bold">Check Now</button>
            </div>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Icons.Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
