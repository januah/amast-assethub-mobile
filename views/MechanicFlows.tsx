
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, StatusBadge, SectionHeader } from '../components/Shared';
import { Icons, REPLACEMENT_STATUS_COLORS } from '../constants';
import { UserRole } from '../types';

interface MechanicJob {
  id: string;
  type: 'Breakdown' | 'Onsite Service' | 'Service & Repair';
  asset: string;
  location: string;
  requester: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  status: 'Assigned' | 'En-route' | 'Arrived' | 'Inspection' | 'Work-in-progress' | 'Completed';
  dueTime: string;
  tenant: string;
  createdAt: string;
  createdBy: string;
}

const MOCK_JOBS: MechanicJob[] = [
  {
    id: 'JOB-MECH-4821',
    type: 'Service & Repair',
    asset: 'Toyota Hiace Ambulance (WMX 4821)',
    location: 'Hospital Seri Botani - Workshop',
    requester: 'Driver Ahmad',
    priority: 'Urgent',
    status: 'Assigned',
    dueTime: '2h 15m left',
    tenant: 'Central Workshop A',
    createdAt: '25 Oct 2023, 08:30',
    createdBy: 'HOM Zul'
  },
  {
    id: 'JOB-MECH-9902',
    type: 'Onsite Service',
    asset: 'Mercedes Sprinter (WVB 9902)',
    location: 'KL Sentral - Drop-off A',
    requester: 'Driver Sam',
    priority: 'Normal',
    status: 'En-route',
    dueTime: '4h 30m left',
    tenant: 'Central Workshop A',
    createdAt: '25 Oct 2023, 10:15',
    createdBy: 'HOM Zul'
  },
  {
    id: 'JOB-MECH-4401',
    type: 'Breakdown',
    asset: 'Ambulance Unit 04',
    location: 'MRR2 Highway - KM 12.5',
    requester: 'Driver Kamal',
    priority: 'Critical',
    status: 'Completed',
    dueTime: 'Finished',
    tenant: 'Central Workshop A',
    createdAt: '24 Oct 2023, 14:00',
    createdBy: 'System Alert'
  }
];

export const MechanicDashboard: React.FC<{ onSelectJob: (id: string) => void }> = ({ onSelectJob }) => {
  const [filter, setFilter] = useState<'New' | 'In Progress' | 'Completed'>('New');

  const filteredJobs = MOCK_JOBS.filter(job => {
    if (filter === 'New') return job.status === 'Assigned';
    if (filter === 'In Progress') return ['En-route', 'Arrived', 'Inspection', 'Work-in-progress'].includes(job.status);
    return job.status === 'Completed';
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="My Jobs" />
      
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Jobs className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Central Workshop A</span>
        </div>
      </div>

      <div className="flex p-1 bg-white border-b border-slate-100">
        {(['New', 'In Progress', 'Completed'] as const).map((t) => (
          <button 
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
              filter === t ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {filteredJobs.length > 0 ? filteredJobs.map((job) => (
          <Card key={job.id} onClick={() => onSelectJob(job.id)} className="border-l-4 border-l-sky-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{job.id} • {job.type}</span>
              <StatusBadge status={job.status === 'Completed' ? 'Completed' : 'In Progress'} />
            </div>
            
            <h4 className="font-bold text-slate-800 text-sm mb-1">{job.asset}</h4>
            
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Icons.Navigation className="w-3 h-3" /> {job.location}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Icons.User className="w-3 h-3" /> Requester: {job.requester}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
              <div className={`text-[10px] font-bold uppercase ${
                job.priority === 'Critical' ? 'text-red-500' : 
                job.priority === 'Urgent' ? 'text-amber-500' : 'text-sky-500'
              }`}>
                {job.priority} Priority
              </div>
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Icons.Clock className="w-3 h-3" /> Due: {job.dueTime}
              </div>
            </div>

            <div className="mt-4">
              <button className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                View Job <Icons.ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </Card>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icons.Jobs className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 text-sm italic">No {filter.toLowerCase()} jobs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const MechanicJobDetail: React.FC<{ 
  jobId: string; 
  onBack: () => void;
  onComplete: () => void;
}> = ({ jobId, onBack, onComplete }) => {
  const job = MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];
  const [status, setStatus] = useState(job.status);
  const [showModal, setShowModal] = useState(false);

  const renderActions = () => {
    switch(status) {
      case 'Assigned':
        return (
          <button 
            onClick={() => setStatus('En-route')}
            className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Acknowledge & Start En-route
          </button>
        );
      case 'En-route':
        return (
          <button 
            onClick={() => setStatus('Arrived')}
            className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Mark as Arrived
          </button>
        );
      case 'Arrived':
        return (
          <button 
            onClick={() => setStatus('Inspection')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Start Inspection
          </button>
        );
      case 'Inspection':
        return (
          <button 
            onClick={() => setStatus('Work-in-progress')}
            className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Finish Inspection & Start Work
          </button>
        );
      case 'Work-in-progress':
        return (
          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Complete Job
          </button>
        );
      case 'Completed':
        return (
          <button 
            onClick={onBack}
            className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:bg-slate-200 transition-colors"
          >
            Back to Dashboard
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Job Detail" showBack onBack={onBack} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        <Card className="bg-white border-t-4 border-t-sky-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.id}</span>
              <h2 className="text-lg font-bold text-slate-900">{job.asset}</h2>
            </div>
            <StatusBadge status={status === 'Completed' ? 'Completed' : 'In Progress'} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Priority</div>
              <div className={`text-xs font-bold ${job.priority === 'Critical' ? 'text-red-500' : 'text-slate-800'}`}>{job.priority}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Due Time</div>
              <div className="text-xs font-bold text-slate-800">{job.dueTime}</div>
            </div>
          </div>
        </Card>

        <SectionHeader title="Asset Information" />
        <Card className="space-y-3">
          <div className="flex justify-between text-xs py-1 border-b border-slate-50">
            <span className="text-slate-500">Vehicle Plate</span>
            <span className="font-bold text-slate-800">{job.asset.split('(')[1]?.replace(')', '') || 'WMX 4821'}</span>
          </div>
          <div className="flex justify-between text-xs py-1">
            <span className="text-slate-500">Tenant</span>
            <span className="font-bold text-slate-800">{job.tenant}</span>
          </div>
        </Card>

        <SectionHeader title="Location & Access" />
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl"><Icons.Navigation className="w-4 h-4" /></div>
              <div className="text-xs font-bold text-slate-800">{job.location}</div>
            </div>
            <button className="text-[10px] font-black text-sky-600 uppercase border border-sky-100 px-3 py-1 rounded-lg active:bg-sky-50">Navigate</button>
          </div>
          <div className="bg-white rounded-3xl p-4 border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-slate-50 text-slate-400 rounded-xl"><Icons.User className="w-4 h-4" /></div>
            <div>
              <div className="text-xs font-bold text-slate-800">{job.requester}</div>
              <div className="text-[10px] text-slate-400 font-medium">Requester (On-site)</div>
            </div>
          </div>
        </div>

        <SectionHeader title="Technical Notes" />
        <div className="bg-white rounded-3xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 italic leading-relaxed">
            "Reported engine overheating and loss of power. Please check coolant levels and radiatior fan functioning first."
          </p>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 flex items-center justify-center gap-2 active:bg-slate-50">
              <Icons.Report className="w-3 h-3" /> Add Note
            </button>
            <button className="flex-1 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 flex items-center justify-center gap-2 active:bg-slate-50">
              <Icons.Plus className="w-3 h-3" /> Add Photo
            </button>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <Icons.Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-800 leading-tight">
            <strong>Metadata:</strong> Created by {job.createdBy} on {job.createdAt}. Job isolation: {job.tenant}.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        {renderActions()}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full bg-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Icons.Check className="w-8 h-8" />
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Job?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Confirm that all repairs for <strong>{job.asset}</strong> are finished and the asset is ready for deployment.
            </p>

            <button 
              onClick={() => { setStatus('Completed'); setShowModal(false); onComplete(); }}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Confirm Completion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MechanicHistory: React.FC<{ onSelectJob: (id: string) => void }> = ({ onSelectJob }) => {
  const completedJobs = MOCK_JOBS.filter(j => j.status === 'Completed');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Work History" />
      
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last 30 Days</span>
        </div>
        <button className="p-2 bg-slate-50 rounded-lg text-slate-400">
          <Icons.Search className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {completedJobs.length > 0 ? completedJobs.map((job) => (
          <Card key={job.id} onClick={() => onSelectJob(job.id)} className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{job.id}</span>
              <StatusBadge status="Completed" />
            </div>
            
            <h4 className="font-bold text-slate-800 text-sm mb-1">{job.asset}</h4>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[10px] text-slate-500">
                {job.createdAt.split(',')[0]}
              </div>
              <div className="text-[10px] font-bold text-sky-600 flex items-center gap-1 uppercase">
                View Outcome <Icons.ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Card>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icons.History className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 text-sm italic">No completed jobs yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
