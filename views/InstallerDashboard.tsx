
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons, INSTALL_STATUS_COLORS } from '../constants';
import { InstallationService, InstallationStatus } from '../types';

const MOCK_INSTALLATIONS: InstallationService[] = [
  {
    id: 'INS-001',
    docNo: 'SR-INSTALL-2023-440',
    status: 'assigned',
    asset: { tag: 'TAG-1002', name: 'GE MRI Magnetom', model: 'M-100', serial: 'SN-4490' },
    hospital: { name: 'Pantai Hospital KL', site: 'Radiology Wing', tenantId: 'TEN-01' },
    vendor: 'GE Healthcare',
    dueDate: '2023-10-30',
    createdAt: '2023-10-25',
    acknowledgements: []
  },
  {
    id: 'INS-002',
    docNo: 'SR-INSTALL-2023-442',
    status: 'in_progress',
    asset: { tag: 'TAG-2201', name: 'Mindray Anesthesia System', model: 'A-7', serial: 'SN-2210' },
    hospital: { name: 'Pantai Hospital KL', site: 'OT-4', tenantId: 'TEN-01' },
    vendor: 'Mindray Medical',
    dueDate: '2023-11-05',
    createdAt: '2023-10-26',
    acknowledgements: []
  },
  {
    id: 'INS-003',
    docNo: 'SR-INSTALL-2023-410',
    status: 'pending_ack',
    asset: { tag: 'TAG-998', name: 'Patient Monitor B40', model: 'B40-Pro', serial: 'SN-8821' },
    hospital: { name: 'Gleneagles KL', site: 'ICU-B', tenantId: 'TEN-02' },
    vendor: 'GE Healthcare',
    dueDate: '2023-10-22',
    createdAt: '2023-10-15',
    acknowledgements: [
      { type: 'asset_manager', status: 'signed', signedAt: '2023-10-25 10:00' },
      { type: 'end_user', status: 'pending' },
      { type: 'finance_manager', status: 'pending' }
    ]
  }
];

export const InstallerDashboard: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const [filter, setFilter] = useState<InstallationStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_INSTALLATIONS.filter(item => 
    (filter === 'all' || item.status === filter) &&
    (item.asset.name.toLowerCase().includes(search.toLowerCase()) || item.docNo.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: MOCK_INSTALLATIONS.length,
    active: MOCK_INSTALLATIONS.filter(i => i.status === 'in_progress').length,
    pending: MOCK_INSTALLATIONS.filter(i => i.status === 'pending_ack').length,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="My Installations" />
      
      <div className="bg-white border-b border-slate-200">
        <div className="grid grid-cols-3 divide-x divide-slate-100 py-4">
          <div className="text-center">
            <div className="text-xl font-black text-slate-900">{stats.total}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-amber-500">{stats.active}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-purple-600">{stats.pending}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sign-offs</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
        <div className="relative flex-1">
          <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-sky-500" 
            placeholder="Search by Tag, Name or Doc #..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase p-2 rounded-xl outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">Progress</option>
          <option value="pending_ack">Sign-offs</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {filtered.length > 0 ? filtered.map((item) => (
          <Card key={item.id} onClick={() => onSelect(item.id)} className="border-l-4 border-l-sky-500">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.docNo}</span>
                <h4 className="font-bold text-slate-800 text-sm">{item.asset.name}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${INSTALL_STATUS_COLORS[item.status]}`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1.5 mt-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <Icons.Navigation className="w-3 h-3 text-slate-300" />
                {item.hospital.name} • {item.hospital.site}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <Icons.Calendar className="w-3 h-3 text-slate-300" />
                Target Date: <span className="text-slate-700 font-bold">{item.dueDate}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-50">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] font-black ${
                    item.status === 'pending_ack' && i <= item.acknowledgements.filter(a => a.status === 'signed').length 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {i}
                  </div>
                ))}
                <div className="text-[8px] font-bold text-slate-400 ml-6 self-center uppercase tracking-widest">Sign-offs</div>
              </div>
              <div className="text-sky-600 text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest">
                Detail <Icons.ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Card>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Icons.Jobs className="w-16 h-16 mb-4" />
            <p className="text-sm font-bold">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};
