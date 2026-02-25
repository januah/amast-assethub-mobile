
import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../components/Layout';
import { Stepper, Card, StatusBadge } from '../components/Shared';
import { Icons } from '../constants';
import { Scanner } from './Scanner';

interface AssetOption {
  id: string;
  name: string;
}

export const BreakdownFlow: React.FC<{ 
  onComplete: () => void; 
  onCancel: () => void;
  initialAsset?: AssetOption | null;
}> = ({ onComplete, onCancel, initialAsset }) => {
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Form State
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState('Ward 4B (Current)');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Critical'>('Normal');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = ['Select Asset', 'Problem', 'Location', 'Review'];

  const assetOptions: AssetOption[] = [
    { id: 'DF-002', name: 'Phillips Defibrillator X3' },
    { id: 'VS-441', name: 'Mindray Vital Signs Monitor' },
    { id: 'VT-992', name: 'GE Ventilator Carescape' },
    { id: 'OT-105', name: 'Operating Table Steris' },
    { id: 'IF-202', name: 'Infusion Pump Alaris' },
  ];

  const hospitalLocations = [
    'Ward 4B (Current)',
    'Emergency Dept',
    'ICU - Level 1',
    'ICU - Level 2',
    'Operating Theater 1',
    'Operating Theater 2',
    'Radiology Unit',
    'Maternity Ward',
    'Pediatric Clinic',
    'Oncology Dept',
    'Outpatient Pharmacy',
    'Central Lab'
  ];

  useEffect(() => {
    if (initialAsset) {
      setSelectedAsset(initialAsset);
      setStep(1); // Skip selection step if asset is already known
    }
  }, [initialAsset]);

  const filteredAssets = assetOptions.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = hospitalLocations.filter(loc =>
    loc.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      // If we skipped step 0 due to initialAsset, going back from step 1 should go to selection or cancel
      if (step === 1 && initialAsset) {
        onCancel();
      } else {
        setStep(step - 1);
      }
    } else {
      onCancel();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos([...photos, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleScanSuccess = () => {
    const scannedAsset = assetOptions[0];
    setSelectedAsset(scannedAsset);
    setIsScanning(false);
    setStep(1);
  };

  if (isScanning) {
    return <Scanner onScan={handleScanSuccess} onCancel={() => setIsScanning(false)} />;
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Icons.Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Request Submitted!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Your breakdown report for <strong>{selectedAsset?.name}</strong> has been logged. 
          A technician will be notified immediately.
        </p>
        <Card className="w-full mb-8 text-left border-emerald-100 bg-emerald-50/30">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Reference Number</div>
          <div className="text-xl font-black text-slate-900">REQ-{Math.floor(Math.random() * 9000) + 1000}</div>
        </Card>
        <button 
          onClick={onComplete}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Report Breakdown" showBack onBack={handleBack} />
      <Stepper steps={steps} current={step} />

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Which device is broken?</h3>
            <div className="relative">
              <Icons.Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                placeholder="Search by ID or Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                <Card 
                  key={asset.id} 
                  onClick={() => setSelectedAsset(asset)}
                  className={`flex items-center gap-3 transition-all ${selectedAsset?.id === asset.id ? 'border-sky-500 bg-sky-50/50' : ''}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedAsset?.id === asset.id ? 'bg-sky-600 border-sky-600' : 'border-slate-300'}`}>
                    {selectedAsset?.id === asset.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-800">{asset.name}</span>
                    <span className="text-[10px] text-slate-400 block uppercase">ID: {asset.id}</span>
                  </div>
                </Card>
              )) : (
                <div className="text-center py-8 text-slate-400 text-sm italic">No assets found matching your search.</div>
              )}
            </div>
            <button 
              onClick={() => setIsScanning(true)}
              className="w-full p-6 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 bg-white/50 active:bg-slate-100 transition-colors"
            >
              <Icons.QR className="w-10 h-10" />
              <span className="text-xs font-bold uppercase tracking-widest">Scan QR Code</span>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Describe the problem</h3>
            <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl mb-4 flex items-center gap-2">
               <Icons.Report className="w-4 h-4 text-sky-600" />
               <span className="text-xs font-bold text-sky-800 truncate">{selectedAsset?.name} ({selectedAsset?.id})</span>
            </div>
            <textarea 
              rows={5}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Provide a brief description of the issue (e.g., 'Device fails to power on', 'Error code E-102 displayed')..."
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
            />
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Attach Photos (Optional)</label>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={photo} alt="Asset problem" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 shadow-sm"
                    >
                      <Icons.X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-sky-600 hover:border-sky-300 transition-all active:scale-95"
                >
                  <Icons.Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Where is the asset?</h3>
            
            <div className="relative">
              <Icons.Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                placeholder="Search location (e.g. Ward, OT, ICU)..." 
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
              {filteredLocations.length > 0 ? filteredLocations.map((loc) => (
                <button 
                  key={loc} 
                  onClick={() => setLocation(loc)}
                  className={`p-4 rounded-2xl text-left text-sm font-bold border-2 transition-all flex items-center justify-between ${
                    location === loc ? 'border-sky-500 bg-sky-50 text-sky-600' : 'bg-white border-slate-100 text-slate-500'
                  }`}
                >
                  <span>{loc}</span>
                  {location === loc && <Icons.Check className="w-4 h-4" />}
                </button>
              )) : (
                <div className="text-center py-8 text-slate-400 text-sm italic">No matching locations found.</div>
              )}
            </div>
            
            <div className="pt-6 border-t border-slate-200 mt-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Priority Level</h4>
              <div className="flex gap-3">
                {(['Normal', 'Urgent', 'Critical'] as const).map((prio) => (
                  <button 
                    key={prio} 
                    onClick={() => setPriority(prio)}
                    className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      priority === prio 
                        ? (prio === 'Critical' ? 'bg-red-50 border-red-500 text-red-600' : prio === 'Urgent' ? 'bg-amber-50 border-amber-500 text-amber-600' : 'bg-sky-50 border-sky-500 text-sky-600')
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Request Summary</h3>
            <Card className="p-0 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Asset</span>
                  <StatusBadge status={priority === 'Critical' ? 'Rejected' : priority === 'Urgent' ? 'In Progress' : 'Pending' as any} />
                </div>
                <div className="text-lg font-black text-slate-900">{selectedAsset?.name || 'No Asset Selected'}</div>
                <div className="text-xs text-slate-500">ID: {selectedAsset?.id}</div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Location</span>
                    <div className="text-sm font-bold text-slate-800">{location}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Priority</span>
                    <div className={`text-sm font-bold ${priority === 'Critical' ? 'text-red-600' : priority === 'Urgent' ? 'text-amber-600' : 'text-sky-600'}`}>{priority}</div>
                  </div>
                </div>
                
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Problem Description</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl mt-1 italic">
                    {problemDescription || 'No description provided.'}
                  </p>
                </div>

                {photos.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Attached Photos ({photos.length})</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                      {photos.map((p, i) => (
                        <img key={i} src={p} className="w-16 h-16 rounded-lg object-cover border border-slate-200" alt="Thumbnail" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <Icons.Breakdown className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-800 leading-tight">
                <strong>Heads up!</strong> Average response time for {location} is 15 minutes. A biomedical technician will be notified once you submit.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
        <button 
          disabled={step === 0 && !selectedAsset}
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
            step === 0 && !selectedAsset 
              ? 'bg-slate-200 text-slate-400' 
              : 'bg-sky-600 text-white'
          }`}
        >
          {step === steps.length - 1 ? 'Submit Request' : 'Continue'}
          <Icons.ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
