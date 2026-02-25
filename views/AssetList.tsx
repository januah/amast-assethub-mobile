
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons } from '../constants';
import { UserRole, Asset } from '../types';

interface AssetListProps {
  role: UserRole;
  onBack: () => void;
  onReportIssue?: (asset: { id: string, name: string }) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ role, onBack, onReportIssue }) => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const isAmbulanceRole = role === UserRole.AMBULANCE_DRIVER || role === UserRole.HEAD_MECHANIC;
  
  const assets = isAmbulanceRole ? [
    { id: 'WMX-4821', name: 'Toyota Hiace Ambulance', type: 'Type B', status: 'Completed', location: 'HQ Garage', nextPpm: '15 Nov 2023' },
    { id: 'WVB-9902', name: 'Mercedes Sprinter', type: 'Type A', status: 'In Progress', location: 'On Call', nextPpm: '20 Nov 2023' },
  ] : [
    { id: 'DF-002', name: 'Phillips Defibrillator X3', type: 'Life Support', status: 'Completed', location: 'Ward 4B', nextPpm: '12 Dec 2023' },
    { id: 'VS-441', name: 'Mindray Vital Signs Monitor', type: 'Monitoring', status: 'Pending', location: 'ICU-1', nextPpm: '05 Jan 2024' },
  ];

  if (view === 'detail' && selectedAsset) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <Header title="Asset Detail" showBack onBack={() => setView('list')} />
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
                {isAmbulanceRole ? <Icons.Truck className="w-8 h-8" /> : <Icons.Plus className="w-8 h-8" />}
              </div>
              <StatusBadge status={selectedAsset.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{selectedAsset.name}</h2>
            <p className="text-sm text-slate-500">{selectedAsset.id}</p>
          </div>

          <SectionHeader title="Technical Specs" />
          <Card className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Model</span><span className="font-medium">2023 Rev-X</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Warranty</span><span className="font-medium text-emerald-600">Active (Exp 2025)</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Location</span><span className="font-medium">{selectedAsset.location}</span></div>
          </Card>

          <SectionHeader title="Service History" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold">Annual PPM</div>
                  <div className="text-[10px] text-slate-400">Completed by Eng. Zul • 12 Oct 2023</div>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
          <button 
            onClick={() => onReportIssue?.({ id: selectedAsset.id, name: selectedAsset.name })}
            className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Report New Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={isAmbulanceRole ? "Ambulance Management" : "Medical Devices"} showBack onBack={onBack} />
      <div className="p-4 bg-white border-b border-slate-100">
        <div className="relative">
          <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none" placeholder="Search by ID or Name..." />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
        {assets.map((asset) => (
          <Card key={asset.id} onClick={() => { setSelectedAsset(asset); setView('detail'); }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                {isAmbulanceRole ? <Icons.Truck className="w-6 h-6" /> : <Icons.Plus className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{asset.id}</span>
                  <StatusBadge status={asset.status as any} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{asset.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Icons.Navigation className="w-3 h-3" /> {asset.location}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Icons.Calendar className="w-3 h-3" /> PPM: {asset.nextPpm}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
