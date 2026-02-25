
import React, { useState } from 'react';
import { Header } from '../components/Layout';
import { Card, SectionHeader, StatusBadge } from '../components/Shared';
import { Icons } from '../constants';

type RecordType = 'Breakdown' | 'Onsite' | 'PPM';
type DocType = 'Service Report' | 'Invoice';

interface RecordItem {
  id: string;
  asset: string;
  status: 'Completed' | 'Rejected' | 'Approved' | 'Pending' | 'In Progress';
  type: RecordType;
  date: string;
  description: string;
  requester: string;
  location: string;
  hasChecklist?: boolean;
}

interface DocItem {
  id: string;
  type: DocType;
  date: string;
  amount?: string;
  status: string;
  asset: string;
}

export const RecordsView: React.FC<{ onOpenChecklist?: () => void }> = ({ onOpenChecklist }) => {
  const [tab, setTab] = useState<'requests' | 'docs'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<RecordItem | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  const mockRequests: RecordItem[] = [
    { 
      id: 'REQ-9921', 
      asset: 'Defibrillator X3', 
      status: 'Completed', 
      type: 'Breakdown', 
      date: '24 Oct 2023',
      description: 'The device was not charging. Battery module replaced and calibrated.',
      requester: 'Dr. Sarah Jones',
      location: 'Ward 4B',
      hasChecklist: true
    },
    { 
      id: 'REQ-9918', 
      asset: 'Oxygen Tank', 
      status: 'Rejected', 
      type: 'Onsite', 
      date: '22 Oct 2023',
      description: 'Request for secondary tank refill. Rejected due to over-stocking in ward.',
      requester: 'Nurse Kamal',
      location: 'Emergency Dept'
    },
    { 
      id: 'REQ-9855', 
      asset: 'Vital Monitor', 
      status: 'Approved', 
      type: 'PPM', 
      date: '20 Oct 2023',
      description: 'Routine quarterly preventive maintenance scheduled.',
      requester: 'System Generated',
      location: 'ICU-1'
    },
  ];

  const mockDocs: DocItem[] = [
    { id: 'SR-2023-001', type: 'Service Report', date: '24 Oct 2023', status: 'Finalized', asset: 'Defibrillator X3' },
    { id: 'INV-0992821', type: 'Invoice', date: '22 Oct 2023', amount: 'RM 1,250.00', status: 'Paid', asset: 'Oxygen Tank' },
    { id: 'SR-2023-002', type: 'Service Report', date: '20 Oct 2023', status: 'Draft', asset: 'Vital Monitor' },
  ];

  if (selectedRequest) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <Header title="Request Details" showBack onBack={() => setSelectedRequest(null)} />
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedRequest.id}</span>
              <StatusBadge status={selectedRequest.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{selectedRequest.asset}</h2>
            <p className="text-xs text-slate-500 mt-1">{selectedRequest.type} Request • {selectedRequest.date}</p>
          </div>

          {selectedRequest.status === 'Completed' && selectedRequest.hasChecklist && (
            <Card className="mb-6 bg-sky-600 text-white border-none shadow-lg shadow-sky-100 flex items-center justify-between">
               <div>
                  <h4 className="text-sm font-bold">Technical Report Available</h4>
                  <p className="text-[10px] opacity-80 mt-1">Checklist results and maintenance logs ready.</p>
               </div>
               <button 
                onClick={onOpenChecklist}
                className="px-4 py-2 bg-white text-sky-600 rounded-xl text-[10px] font-black uppercase"
               >
                 View Report
               </button>
            </Card>
          )}

          <SectionHeader title="Timeline" />
          <div className="px-6 py-4 bg-white rounded-3xl border border-slate-200 mb-6">
            {[
              { label: 'Request Logged', time: '09:00 AM', completed: true },
              { label: 'Technician Assigned', time: '10:15 AM', completed: true },
              { label: 'Work in Progress', time: '11:00 AM', completed: selectedRequest.status === 'Completed' },
              { label: 'Completed', time: '02:30 PM', completed: selectedRequest.status === 'Completed' },
            ].map((step, i, arr) => (
              <div key={i} className="flex gap-4 items-start last:mb-0 mb-6 relative">
                {i < arr.length - 1 && (
                  <div className={`absolute left-2.5 top-6 w-0.5 h-10 ${step.completed && arr[i+1].completed ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                )}
                <div className={`w-5 h-5 rounded-full z-10 flex items-center justify-center border-2 transition-colors ${
                  step.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'
                }`}>
                  {step.completed && <Icons.Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className={`text-xs font-bold ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{step.time}</div>
                </div>
              </div>
            ))}
          </div>

          <SectionHeader title="Information" />
          <Card className="space-y-4 mb-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Requester</div>
              <div className="text-sm font-bold text-slate-800">{selectedRequest.requester}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</div>
                <div className="text-sm font-bold text-slate-800">{selectedRequest.location}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</div>
                <div className="text-sm font-bold text-slate-800">{selectedRequest.date}</div>
              </div>
            </div>
          </Card>
        </div>
        <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Icons.Phone className="w-4 h-4" /> Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Document Detail View
  if (selectedDoc) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <Header title="Document View" showBack onBack={() => setSelectedDoc(null)} />
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${selectedDoc.type === 'Invoice' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
              {selectedDoc.type === 'Invoice' ? <Icons.Finance className="w-8 h-8" /> : <Icons.Report className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedDoc.id}</span>
              <h2 className="text-lg font-bold text-slate-900">{selectedDoc.type}</h2>
              <p className="text-xs text-slate-500">{selectedDoc.date}</p>
            </div>
          </div>

          <SectionHeader title="Preview" />
          <div className="bg-white rounded-3xl border border-slate-200 p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
               <Icons.Report className="w-8 h-8" />
             </div>
             <h3 className="font-bold text-slate-800 mb-2">Technical Summary</h3>
             <p className="text-xs text-slate-400 mb-8 max-w-[200px]">Secure digital copy. Authenticated with ISO compliance markers.</p>
             
             <div className="w-full max-w-xs space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Target Asset</span>
                  <span className="text-xs font-bold text-slate-800">{selectedDoc.asset}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 uppercase tracking-tight">{selectedDoc.status}</span>
                </div>
             </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-200 safe-bottom flex gap-3">
          <button className="flex-1 py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Icons.Report className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Records & History" />
      <div className="flex p-1 bg-white border-b border-slate-100">
        <button 
          onClick={() => setTab('requests')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tab === 'requests' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          My Requests
        </button>
        <button 
          onClick={() => setTab('docs')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tab === 'docs' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400'}`}
        >
          Docs & Invoices
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar pb-20">
        {tab === 'requests' ? (
          <div className="space-y-3">
            {mockRequests.map((req) => (
              <Card key={req.id}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-400">{req.id} • {req.type}</span>
                  <StatusBadge status={req.status as any} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{req.asset}</h4>
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    className="flex-1 py-2 bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Details
                  </button>
                  {req.hasChecklist && (
                    <button 
                      onClick={onOpenChecklist}
                      className="px-4 py-2 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-bold uppercase"
                    >
                      Report
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <SectionHeader title="Service Reports" />
            {mockDocs.filter(d => d.type === 'Service Report').map((doc) => (
              <button 
                key={doc.id} 
                onClick={() => setSelectedDoc(doc)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 active:scale-[0.98] transition-all text-left"
              >
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl shrink-0"><Icons.Report className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{doc.id}</div>
                  <div className="text-[10px] text-slate-400">{doc.asset} • {doc.date}</div>
                </div>
                <Icons.ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
