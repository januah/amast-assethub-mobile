
import React from 'react';
import { Card, SectionHeader, ActionButton } from '../components/Shared';
import { Header } from '../components/Layout';
import { Icons } from '../constants';

export const AdminHospitalDashboard: React.FC<{ onAction: (flow: string) => void }> = ({ onAction }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Admin Hospital" onNotificationClick={() => onAction('notifications')} />
      
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Navigation className="w-4 h-4 text-sky-600" />
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">General Hospital KL (HQ)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        {/* KPI Section */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-sky-600 text-white border-none text-center p-4">
            <div className="text-2xl font-black">42</div>
            <div className="text-[8px] font-bold uppercase tracking-wider opacity-80">Hospital Users</div>
          </Card>
          <Card className="bg-slate-900 text-white border-none text-center p-4">
            <div className="text-2xl font-black">156</div>
            <div className="text-[8px] font-bold uppercase tracking-wider opacity-80">Total Assets</div>
          </Card>
          <Card className="bg-white text-slate-800 text-center p-4">
            <div className="text-2xl font-black text-amber-500">12</div>
            <div className="text-[8px] font-bold uppercase tracking-wider opacity-80">Open Requests</div>
          </Card>
          <Card className="bg-white text-slate-800 text-center p-4">
            <div className="text-2xl font-black text-emerald-500">284</div>
            <div className="text-[8px] font-bold uppercase tracking-wider opacity-80">Completed YTD</div>
          </Card>
        </div>

        <SectionHeader title="Management Console" />
        <div className="grid grid-cols-1 gap-3 mb-6">
          <ActionButton 
            label="User Management" 
            icon="User" 
            sublabel="Doctors, Drivers & Approvers" 
            onClick={() => onAction('manage_users')} 
          />
          <ActionButton 
            label="Asset Registry" 
            icon="List" 
            sublabel="Devices & Ambulance Inventory" 
            onClick={() => onAction('assets')} 
          />
          <ActionButton 
            label="Compliance Reports" 
            icon="Report" 
            sublabel="Maintenance & Service Logs" 
            onClick={() => onAction('admin_reports')} 
          />
        </div>

        <SectionHeader title="Recent Activity" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                <Icons.Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800">User Registered</div>
                <div className="text-[10px] text-slate-400 font-medium">Dr. Lim joined Medical Officer pool</div>
              </div>
              <div className="text-[8px] font-bold text-slate-400">1h ago</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
