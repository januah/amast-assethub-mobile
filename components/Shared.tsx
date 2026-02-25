
import React from 'react';
import { Icons, STATUS_COLORS } from '../constants';
import { Status } from '../types';

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
    {status}
  </span>
);

export const ActionButton: React.FC<{ 
  label: string; 
  icon: keyof typeof Icons; 
  color?: string; 
  onClick?: () => void;
  sublabel?: string;
}> = ({ label, icon, color = 'bg-white', onClick, sublabel }) => {
  const Icon = Icons[icon];
  return (
    <button 
      onClick={onClick}
      className={`${color} border border-slate-200 p-4 rounded-2xl flex flex-col items-start gap-3 shadow-sm active:scale-95 transition-transform text-left w-full h-full`}
    >
      <div className={`p-2 rounded-xl bg-sky-50 text-sky-600`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-bold text-sm text-slate-800">{label}</div>
        {sublabel && <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{sublabel}</div>}
      </div>
    </button>
  );
};

export const SectionHeader: React.FC<{ title: string; onSeeAll?: () => void }> = ({ title, onSeeAll }) => (
  <div className="flex items-center justify-between mb-3 px-4 mt-6">
    <h3 className="font-bold text-slate-900">{title}</h3>
    {onSeeAll && (
      <button onClick={onSeeAll} className="text-xs font-semibold text-sky-600 hover:text-sky-700">
        See All
      </button>
    )}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm ${className} ${onClick ? 'active:bg-slate-50 cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

export const Stepper: React.FC<{ steps: string[]; current: number }> = ({ steps, current }) => (
  <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 overflow-x-auto hide-scrollbar">
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className="flex flex-col items-center min-w-max">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            idx <= current ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            {idx + 1}
          </div>
          <span className={`text-[10px] mt-1 font-medium ${idx <= current ? 'text-sky-600' : 'text-slate-400'}`}>
            {step}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`h-[2px] flex-1 mx-2 min-w-[20px] mb-4 ${idx < current ? 'bg-sky-600' : 'bg-slate-100'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);
