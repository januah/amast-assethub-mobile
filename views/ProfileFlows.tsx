
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader } from '../components/Shared';
import { Icons } from '../constants';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  staffId: string;
  workplace: string;
  dept: string;
}

export const EditProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [data, setData] = useState<ProfileData>({
    name: 'Dr. Sarah Jones',
    email: 'sarah.jones@hospital.com',
    phone: '+60 12-345 6789',
    staffId: 'STAFF-9921',
    workplace: 'General Hospital KL',
    dept: 'Ward 4B (Cardiology)'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Edit Profile" showBack onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="relative">
            <div className="w-24 h-24 bg-sky-100 rounded-3xl flex items-center justify-center text-sky-600 text-3xl font-bold border-4 border-white shadow-lg overflow-hidden">
              <Icons.User className="w-12 h-12" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-sky-600 text-white rounded-xl shadow-lg border-2 border-white active:scale-90 transition-transform">
              <Icons.Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 tracking-widest">Profile Picture</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
            <input 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email Address</label>
            <input 
              type="email" 
              value={data.email} 
              onChange={e => setData({...data, email: e.target.value})}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Phone Number</label>
            <input 
              value={data.phone} 
              onChange={e => setData({...data, phone: e.target.value})}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Staff ID</label>
              <input 
                disabled 
                value={data.staffId} 
                className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Workplace</label>
              <input 
                value={data.workplace} 
                onChange={e => setData({...data, workplace: e.target.value})}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Department / Ward</label>
            <input 
              value={data.dept} 
              onChange={e => setData({...data, dept: e.target.value})}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
            />
          </div>
        </form>
      </div>
      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <button onClick={handleSave} className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export const NotificationSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    breakdown: true,
    ppm: true,
    approvals: true,
    updates: false,
    email: true,
    push: true
  });

  const Toggle = ({ active, onClick, label, desc }: { active: boolean, onClick: () => void, label: string, desc: string }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
      <div className="max-w-[75%]">
        <div className="text-sm font-bold text-slate-800">{label}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
      </div>
      <button 
        onClick={onClick}
        className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-sky-600' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1 shadow-sm'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Notifications" showBack onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        <div>
          <SectionHeader title="Alert Preferences" />
          <div className="space-y-3">
            <Toggle 
              label="Breakdown Alerts" 
              desc="Instant notifications when a device breakdown is reported in your ward."
              active={settings.breakdown} 
              onClick={() => setSettings({...settings, breakdown: !settings.breakdown})} 
            />
            <Toggle 
              label="PPM Reminders" 
              desc="Get reminded 24 hours before a scheduled maintenance."
              active={settings.ppm} 
              onClick={() => setSettings({...settings, ppm: !settings.ppm})} 
            />
            <Toggle 
              label="Approval Status" 
              desc="Notifications when your requests are approved or rejected."
              active={settings.approvals} 
              onClick={() => setSettings({...settings, approvals: !settings.approvals})} 
            />
          </div>
        </div>

        <div>
          <SectionHeader title="Channel Settings" />
          <div className="space-y-3">
            <Toggle 
              label="Push Notifications" 
              desc="Receive alerts on your mobile device even when app is closed."
              active={settings.push} 
              onClick={() => setSettings({...settings, push: !settings.push})} 
            />
            <Toggle 
              label="Email Reports" 
              desc="Weekly summaries and service reports sent to your inbox."
              active={settings.email} 
              onClick={() => setSettings({...settings, email: !settings.email})} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChangePassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Change Password" showBack onBack={onBack} />
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
          <Icons.Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-800 leading-tight">
            <strong>Security Tip:</strong> Choose a password that is unique and at least 8 characters long, including numbers and symbols.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Current Password</label>
            <input 
              type="password"
              placeholder="••••••••"
              value={form.current}
              onChange={e => setForm({...form, current: e.target.value})}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
            />
          </div>
          
          <div className="h-px bg-slate-100 my-2" />

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">New Password</label>
            <input 
              type="password"
              placeholder="••••••••"
              value={form.new}
              onChange={e => setForm({...form, new: e.target.value})}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Confirm New Password</label>
            <input 
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={e => setForm({...form, confirm: e.target.value})}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
            />
          </div>
        </form>
      </div>
      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <button 
          onClick={handleUpdate}
          disabled={!form.current || !form.new || form.new !== form.confirm}
          className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
            form.current && form.new && form.new === form.confirm 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Update Password
        </button>
      </div>
    </div>
  );
};
