
import React from 'react';
import { Header } from '../components/Layout';
import { Icons } from '../constants';

export interface Notification {
  id: number;
  title: string;
  desc: string;
  type: 'success' | 'warning' | 'info';
  time: string;
  read: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onClearOne: (id: number) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onBack, 
  onMarkAllRead,
  onClearOne 
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Notifications" showBack onBack={onBack} />
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {notifications.length > 0 ? (
          <div className="p-4 space-y-3">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`bg-white p-4 rounded-2xl border transition-all flex gap-4 active:bg-slate-50 relative overflow-hidden ${
                  n.read ? 'border-slate-200 opacity-75' : 'border-sky-200 shadow-sm'
                }`}
              >
                {!n.read && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                  n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
                }`}>
                  {n.type === 'success' ? <Icons.Check className="w-5 h-5" /> : 
                   n.type === 'warning' ? <Icons.Calendar className="w-5 h-5" /> : <Icons.Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className={`font-bold text-sm ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>{n.title}</h4>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.desc}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onClearOne(n.id); }}
                  className="p-1 text-slate-300 hover:text-red-400 transition-colors"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-10">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Icons.Bell className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-slate-800">No Notifications</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">You're all caught up! New updates about your requests will appear here.</p>
          </div>
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-4 text-center border-t border-slate-100 bg-white safe-bottom">
          <button 
            onClick={onMarkAllRead}
            className="text-xs font-bold text-sky-600 uppercase tracking-widest active:scale-95 transition-transform"
          >
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
};
