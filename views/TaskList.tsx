
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, StatusBadge, SectionHeader } from '../components/Shared';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface Task {
  id: string;
  asset: string;
  type: 'PPM' | 'Breakdown' | 'Removal' | 'Towing';
  location: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  time: string;
}

interface TaskListProps {
  role: UserRole;
  onBack: () => void;
  onSelectTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ role, onBack, onSelectTask }) => {
  const [filter, setFilter] = useState<'All' | 'PPM' | 'Breakdown'>('All');

  const mockTasks: Task[] = [
    { id: 'JOB-4401', asset: 'Phillips Defibrillator X3', type: 'Breakdown', location: 'Ward 4B', priority: 'Critical', time: 'Started 10m ago' },
    { id: 'JOB-4402', asset: 'Mindray Vital Signs Monitor', type: 'PPM', location: 'ICU-1', priority: 'Normal', time: 'Due 2:00 PM' },
    { id: 'JOB-4403', asset: 'GE Ventilator Carescape', type: 'Breakdown', location: 'Ward 2A', priority: 'Urgent', time: 'Assigned 1h ago' },
    { id: 'JOB-4405', asset: 'Oxygen Concentrator', type: 'PPM', location: 'Maternity Ward', priority: 'Normal', time: 'Due 4:30 PM' },
    { id: 'JOB-4409', asset: 'Operating Table Steris', type: 'Breakdown', location: 'OT-1', priority: 'Critical', time: 'New Request' },
  ];

  const filteredTasks = mockTasks.filter(t => filter === 'All' || t.type === filter);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Assigned Tasks" showBack onBack={onBack} />
      
      {/* Filter Tabs */}
      <div className="flex p-1 bg-white border-b border-slate-100">
        {(['All', 'PPM', 'Breakdown'] as const).map((t) => (
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
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase">{filteredTasks.length} Jobs in Queue</p>
          <button className="text-[10px] font-bold text-sky-600 flex items-center gap-1">
            <Icons.Search className="w-3 h-3" /> Search
          </button>
        </div>

        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`border-l-4 transition-all hover:translate-x-1 ${
              task.priority === 'Critical' ? 'border-l-red-500' : 
              task.priority === 'Urgent' ? 'border-l-amber-500' : 'border-l-sky-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${task.type === 'Breakdown' ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'}`}>
                  {task.type === 'Breakdown' ? <Icons.Breakdown className="w-4 h-4" /> : <Icons.PPM className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{task.id}</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                task.priority === 'Critical' ? 'bg-red-100 text-red-700' : 
                task.priority === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
              }`}>
                {task.priority}
              </div>
            </div>
            
            <h4 className="font-bold text-slate-800 text-sm mb-1">{task.asset}</h4>
            
            <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
              <div className="flex items-center gap-1">
                <Icons.Navigation className="w-3 h-3" /> {task.location}
              </div>
              <div className="flex items-center gap-1">
                <Icons.Clock className="w-3 h-3" /> {task.time}
              </div>
            </div>

            <button 
              onClick={() => onSelectTask(task.id)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Start Job
              <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Icons.Jobs className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800">No {filter !== 'All' ? filter : ''} Jobs</h3>
            <p className="text-xs text-slate-400 mt-1">Your task queue is clear.</p>
          </div>
        )}
      </div>
    </div>
  );
};
