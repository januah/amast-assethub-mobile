
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, StatusBadge, SectionHeader } from '../components/Shared';
import { Icons } from '../constants';

interface PendingEvent {
  id: string;
  day: number;
  asset: string;
  type: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
}

export const ApprovalCalendar: React.FC<{ onBack: () => void; onSelectItem: (id: string) => void }> = ({ onBack, onSelectItem }) => {
  const [selectedDay, setSelectedDay] = useState(25);
  
  const daysInMonth = 31;
  const startDayOffset = 0; // Starts on Sunday for mock
  
  const events: PendingEvent[] = [
    { id: 'REQ-1209', day: 25, asset: 'Ambulance WMX 4821', type: 'Quotation', priority: 'Critical' },
    { id: 'REQ-1208', day: 25, asset: 'Phillips X3 Monitor', type: 'Quotation', priority: 'Urgent' },
    { id: 'REQ-1192', day: 26, asset: 'ICU Ventilator GE', type: 'Removal', priority: 'Normal' },
    { id: 'REQ-1185', day: 28, asset: 'Vital Monitor Mindray', type: 'Quotation', priority: 'Urgent' },
  ];

  const selectedDayEvents = events.filter(e => e.day === selectedDay);

  const renderCalendar = () => {
    const grid = [];
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    // Weekday headers
    weekdays.forEach(d => {
      grid.push(
        <div key={`header-${d}-${Math.random()}`} className="h-8 flex items-center justify-center text-[10px] font-black text-slate-400">
          {d}
        </div>
      );
    });

    // Calendar days
    for (let i = 1; i <= daysInMonth; i++) {
      const hasEvents = events.some(e => e.day === i);
      const isSelected = selectedDay === i;
      
      grid.push(
        <button
          key={i}
          onClick={() => setSelectedDay(i)}
          className={`relative h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
            isSelected ? 'bg-slate-900 text-white shadow-lg z-10 scale-110' : 'bg-white text-slate-600 hover:bg-slate-50'
          } border border-slate-100`}
        >
          <span className="text-xs font-bold">{i}</span>
          {hasEvents && !isSelected && (
            <div className="absolute bottom-1.5 w-1 h-1 bg-sky-500 rounded-full"></div>
          )}
          {hasEvents && isSelected && (
            <div className="absolute bottom-1.5 w-1 h-1 bg-sky-400 rounded-full"></div>
          )}
        </button>
      );
    }
    return grid;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Approval Schedule" showBack onBack={onBack} />
      
      <div className="p-4 bg-white border-b border-slate-100">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-black text-slate-900">October 2023</h3>
           <div className="flex gap-2">
              <button className="p-2 bg-slate-50 rounded-lg text-slate-400"><Icons.ChevronRight className="w-4 h-4 rotate-180" /></button>
              <button className="p-2 bg-slate-50 rounded-lg text-slate-400"><Icons.ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        <SectionHeader title={`Items for Oct ${selectedDay}`} />
        
        {selectedDayEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDayEvents.map(event => (
              <Card 
                key={event.id} 
                onClick={() => onSelectItem(event.id)}
                className={`border-l-4 ${
                  event.priority === 'Critical' ? 'border-l-red-500' : 
                  event.priority === 'Urgent' ? 'border-l-amber-500' : 'border-l-sky-500'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{event.id} • {event.type}</span>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    event.priority === 'Critical' ? 'bg-red-50 text-red-600' : 
                    event.priority === 'Urgent' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
                  }`}>
                    {event.priority}
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{event.asset}</h4>
                <div className="mt-3 flex justify-end">
                   <button className="text-[10px] font-black text-sky-600 uppercase flex items-center gap-1">
                     Review Request <Icons.ArrowRight className="w-3 h-3" />
                   </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-200">
              <Icons.Calendar className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400 font-medium">No items scheduled for this day.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <button 
          onClick={onBack}
          className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:bg-slate-200 transition-all"
        >
          Close Calendar
        </button>
      </div>
    </div>
  );
};
