
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, StatusBadge, SectionHeader } from '../components/Shared';
import { Icons } from '../constants';

interface ApprovalItem {
  id: string;
  asset: string;
  type: 'Quotation' | 'Removal' | 'PPM Modification';
  priority: 'Normal' | 'Urgent' | 'Critical';
  cost: string;
  requester: string;
  date: string;
}

interface ApprovalListProps {
  onBack: () => void;
  onSelectItem: (id: string) => void;
}

export const ApprovalList: React.FC<ApprovalListProps> = ({ onBack, onSelectItem }) => {
  const [filter, setFilter] = useState<'All' | 'Quotation' | 'Removal'>('All');

  const mockApprovals: ApprovalItem[] = [
    { id: 'REQ-1209', asset: 'Ambulance WMX 4821', type: 'Quotation', priority: 'Critical', cost: 'RM 2,500.00', requester: 'Mech. Ahmad', date: '2h ago' },
    { id: 'REQ-1208', asset: 'Phillips X3 Monitor', type: 'Quotation', priority: 'Urgent', cost: 'RM 1,200.00', requester: 'Eng. Sarah', date: '4h ago' },
    { id: 'REQ-1192', asset: 'ICU Ventilator GE', type: 'Removal', priority: 'Normal', cost: 'RM 0.00', requester: 'Eng. Zul', date: 'Yesterday' },
    { id: 'REQ-1185', asset: 'Vital Monitor Mindray', type: 'Quotation', priority: 'Urgent', cost: 'RM 850.00', requester: 'Eng. Sarah', date: 'Yesterday' },
    { id: 'REQ-1172', asset: 'Operating Table Steris', type: 'Removal', priority: 'Critical', cost: 'RM 0.00', requester: 'Head Mech. Zul', date: '2 days ago' },
  ];

  const filteredItems = mockApprovals.filter(item => filter === 'All' || item.type === filter);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Pending Approvals" showBack onBack={onBack} />
      
      {/* Filter Tabs */}
      <div className="flex p-1 bg-white border-b border-slate-100">
        {(['All', 'Quotation', 'Removal'] as const).map((t) => (
          <button 
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
              filter === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase">{filteredItems.length} Requests Pending</p>
          <div className="flex items-center gap-2">
            <Icons.Finance className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">Total: RM 4,550.00</span>
          </div>
        </div>

        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className={`border-l-4 transition-all active:scale-[0.98] ${
              item.priority === 'Critical' ? 'border-l-red-500' : 
              item.priority === 'Urgent' ? 'border-l-amber-500' : 'border-l-sky-500'
            }`}
            onClick={() => onSelectItem(item.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${item.type === 'Quotation' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                  {item.type === 'Quotation' ? <Icons.Finance className="w-4 h-4" /> : <Icons.Truck className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.id} • {item.type}</span>
              </div>
              <StatusBadge status="Pending" />
            </div>
            
            <h4 className="font-bold text-slate-800 text-sm mb-1">{item.asset}</h4>
            
            <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
              <div className="flex items-center gap-1">
                <Icons.User className="w-3 h-3" /> {item.requester}
              </div>
              <div className="flex items-center gap-1">
                <Icons.Clock className="w-3 h-3" /> {item.date}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
               <div className="text-sm font-black text-slate-900">{item.cost === 'RM 0.00' ? 'Removal (No Cost)' : item.cost}</div>
               <div className="text-sky-600 text-[10px] font-bold flex items-center gap-1 uppercase">
                 Review Now <Icons.ChevronRight className="w-3 h-3" />
               </div>
            </div>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Icons.Check className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800">Clear!</h3>
            <p className="text-xs text-slate-400 mt-1">No {filter !== 'All' ? filter : ''} items pending approval.</p>
          </div>
        )}
      </div>
    </div>
  );
};
