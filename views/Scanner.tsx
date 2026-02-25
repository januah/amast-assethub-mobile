
import React from 'react';
import { Icons } from '../constants';

export const Scanner: React.FC<{ onScan: () => void; onCancel: () => void }> = ({ onScan, onCancel }) => {
  return (
    <div className="relative h-full bg-black overflow-hidden flex flex-col">
      {/* Simulation of Camera Feed */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        
        {/* Scanner Overlay */}
        <div className="relative w-64 h-64 border-2 border-white/50 rounded-3xl overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-sky-500 shadow-[0_0_15px_#0ea5e9] animate-bounce"></div>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-500 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-500 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-500 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-500 rounded-br-xl"></div>
        </div>

        <div className="absolute bottom-32 w-full text-center px-8">
          <h3 className="text-white font-bold text-lg mb-2">Scanning Asset QR Code</h3>
          <p className="text-slate-400 text-sm">Align the QR code on the medical device or ambulance within the frame.</p>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md p-8 flex items-center justify-between safe-bottom">
        <button className="p-4 bg-white/10 rounded-full text-white"><Icons.Plus className="w-6 h-6" /></button>
        <button onClick={onScan} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
          <div className="w-16 h-16 border-4 border-slate-900 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-slate-900 rounded-sm"></div>
          </div>
        </button>
        <button onClick={onCancel} className="p-4 bg-white/10 rounded-full text-white"><Icons.X className="w-6 h-6" /></button>
      </div>
    </div>
  );
};
