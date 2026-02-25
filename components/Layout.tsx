
import React from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  title: string;
  onRoleSwitch?: (role: UserRole) => void;
  showBack?: boolean;
  onBack?: () => void;
  hideNav?: boolean;
}

export const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden relative border-x border-slate-200 shadow-xl">
    {children}
  </div>
);

export const Header: React.FC<{ 
  title: string; 
  showBack?: boolean; 
  onBack?: () => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
}> = ({ title, showBack, onBack, onNotificationClick, unreadCount = 0 }) => (
  <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className="p-1 -ml-1 text-slate-500 hover:text-slate-900 transition-colors">
          <Icons.ChevronRight className="w-6 h-6 rotate-180" />
        </button>
      )}
      <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px]">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onNotificationClick} className="relative p-2 text-slate-500 hover:text-slate-900">
        <Icons.Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full border-2 border-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
        <Icons.User className="w-5 h-5" />
      </div>
    </div>
  </header>
);

export const BottomNav: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: 'Jobs', label: 'Home' },
    { id: 'assets', icon: 'List', label: 'Assets' },
    { id: 'scan', icon: 'QR', label: 'Scan', special: true },
    { id: 'records', icon: 'Report', label: 'Records' },
    { id: 'profile', icon: 'User', label: 'Profile' },
  ];

  return (
    <nav className="sticky bottom-0 z-20 bg-white border-t border-slate-200 safe-bottom flex items-center justify-around px-2 py-1">
      {tabs.map((tab) => {
        const Icon = Icons[tab.icon as keyof typeof Icons] || Icons.Jobs;
        const isActive = activeTab === tab.id;

        if (tab.special) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative -top-5 flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-sky-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-slate-50">
                <Icon className="w-6 h-6" />
              </div>
              <span className="mt-1 text-[10px] font-medium text-sky-600">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-1 flex-1 transition-colors ${
              isActive ? 'text-sky-600' : 'text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="mt-1 text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
