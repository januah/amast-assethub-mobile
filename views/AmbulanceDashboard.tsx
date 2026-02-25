
import React from 'react';
import { ActionButton, Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Header } from '../components/Layout';
import { Icons } from '../constants';

export const AmbulanceDashboard: React.FC<{ onAction: (flow: string) => void }> = ({ onAction }) => {
  return (
    <div className="flex flex-col h-full">
      <Header title="Ambulance Hub" onNotificationClick={() => onAction('notifications')} />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Driver Ahmad</h2>
          <p className="text-sm text-slate-500">Vehicle: WMX 4821 (Toyota Hiace)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ActionButton 
            label="Breakdown" 
            icon="Breakdown" 
            color="bg-white"
            sublabel="Emergency assistance" 
            onClick={() => onAction('breakdown_flow')}
          />
          <ActionButton 
            label="Onsite Service" 
            icon="Truck" 
            color="bg-white"
            sublabel="Minor repairs" 
            onClick={() => onAction('onsite_flow')}
          />
          <ActionButton 
            label="Service & Repair" 
            icon="PPM" 
            color="bg-white"
            sublabel="Workshop visit" 
            onClick={() => onAction('service_repair')}
          />
          <ActionButton 
            label="Vehicle Info" 
            icon="Report" 
            color="bg-white"
            sublabel="History & docs" 
            onClick={() => onAction('assets')}
          />
        </div>

        <SectionHeader title="My Assigned Vehicles" onSeeAll={() => onAction('assets')} />
        <div className="space-y-3">
          <Card className="flex items-center gap-4" onClick={() => onAction('assets')}>
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              <Icons.Truck className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800">WMX 4821</h4>
                <StatusBadge status="Completed" />
              </div>
              <p className="text-xs text-slate-500">Last Service: 12 Oct 2023</p>
            </div>
          </Card>
        </div>

        <SectionHeader title="Active Requests" onSeeAll={() => onAction('records')} />
        <Card className="bg-sky-600 text-white border-none shadow-lg shadow-sky-100 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">REQ-2201 • ONSITE</span>
            <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold">In Transit</div>
          </div>
          <h4 className="font-bold mb-1 text-sm">Engine Warning Light</h4>
          <p className="text-[10px] text-sky-100 opacity-90 mb-4">Location: KL Sentral Drop-off</p>
          <div className="flex gap-2">
            <button onClick={() => onAction('records')} className="flex-1 py-2 bg-white text-sky-600 rounded-lg text-xs font-bold active:scale-95 transition-transform">View Status</button>
            <button className="p-2 bg-white/20 rounded-lg active:scale-95 transition-transform"><Icons.Phone className="w-4 h-4" /></button>
          </div>
        </Card>
      </div>
    </div>
  );
};
