
import React, { useState } from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';

export const Login: React.FC<{ onLogin: (role: UserRole) => void; onGoToRegister: () => void }> = ({ onLogin, onGoToRegister }) => {
  const hospitalRoles = [UserRole.MEDICAL_OFFICER, UserRole.HOSPITAL_APPROVER, UserRole.ADMIN_HOSPITAL];
  const serviceRoles = [UserRole.BIOMEDICAL_ENGINEER, UserRole.INSTALLER, UserRole.MECHANIC, UserRole.HEAD_MECHANIC, UserRole.TOW_TRUCK, UserRole.AMBULANCE_DRIVER];
  const systemRoles = [UserRole.SUPERADMIN, UserRole.VIEWER];

  const RoleSection = ({ title, roles }: { title: string, roles: UserRole[] }) => (
    <div className="space-y-2">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <button 
            key={r} 
            onClick={() => onLogin(r)} 
            className="px-3 py-2 bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 transition-all rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-tighter shadow-sm active:scale-95"
          >
            {r.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-12 pb-10 overflow-y-auto hide-scrollbar">
      <div className="flex-1">
        <div className="mb-10">
          <div className="w-16 h-16 bg-sky-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-sky-200">
            <Icons.Plus className="w-10 h-10 rotate-45" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Mybaiki</h1>
          <p className="text-slate-500">Asset maintenance, simplified.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">User ID</label>
            <input type="text" defaultValue="MECH-0042" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 transition-all" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <button className="text-[10px] font-bold text-sky-600">Forgot Password?</button>
            </div>
            <input type="password" defaultValue="password123" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 transition-all" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button onClick={() => onLogin(UserRole.MEDICAL_OFFICER)} className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">Login</button>
          <button onClick={onGoToRegister} className="w-full py-4 bg-white text-slate-600 rounded-2xl font-bold border border-slate-200">Create Account</button>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Demo Role Selection</p>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <div className="space-y-6">
          <RoleSection title="Hospital Staff" roles={hospitalRoles} />
          <RoleSection title="Service & Engineering" roles={serviceRoles} />
          <RoleSection title="System & Support" roles={systemRoles} />
        </div>
      </div>
    </div>
  );
};

export const Register: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white px-8 pt-10 pb-10">
      <button onClick={onBack} className="mb-6 text-slate-400"><Icons.ChevronRight className="w-6 h-6 rotate-180" /></button>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Join Mybaiki</h1>
      <p className="text-slate-500 mb-8">Select your role and provide your credentials.</p>

      <div className="space-y-4 overflow-y-auto hide-scrollbar flex-1 pb-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Select Role</label>
          <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none font-bold text-slate-800">
            {Object.values(UserRole).filter(r => r !== UserRole.AUTH).map(r => (
              <option key={r} value={r}>{r.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
          <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Enter your name" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Workplace / Hospital</label>
          <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Search hospital..." />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Create Password</label>
          <input type="password" title="password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="••••••••" />
        </div>
      </div>

      <button onClick={onComplete} className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg mt-4">Submit Registration</button>
    </div>
  );
};

export const VerificationStatus: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  return (
    <div className="flex flex-col h-full bg-white items-center justify-center px-10 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center">
          <Icons.Clock className="w-12 h-12 text-sky-600 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-slate-100">
          <Icons.Check className="w-6 h-6 text-emerald-500" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3">Pending Verification</h2>
      <p className="text-slate-500 leading-relaxed mb-8">Your account is currently being reviewed by the hospital administration. This usually takes 24-48 hours.</p>
      <button onClick={onDone} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Back to Login</button>
    </div>
  );
};
