import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Icons } from '../constants';

const API_BASE = typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;

function parseAssetIdFromQrData(data: string): string {
  const trimmed = (data || '').trim();
  if (!trimmed) return '';
  const urlMatch = trimmed.match(/\/(?:assets?\/)?([^/?\s]+)(?:\?|$)/i);
  if (urlMatch) return urlMatch[1];
  return trimmed;
}

async function fetchAssetById(assetId: string): Promise<{ id: string; name: string } | null> {
  const base = (API_BASE || '').replace(/\/$/, '');
  if (!base) return null;
  const url = `${base}/api/mobile/v1/assets/${encodeURIComponent(assetId)}`;
  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || `Asset not found (${res.status})`);
  }
  const data = await res.json();
  const asset = (data as { data?: { asset_id?: string; name?: string } }).data ?? data;
  const id = asset.asset_id ?? (asset as { asset_id?: string }).asset_id ?? assetId;
  const name = asset.name ?? (asset as { name?: string }).name ?? id;
  return { id, name };
}

export const Scanner: React.FC<{
  onScan: (asset: { id: string; name: string }) => void;
  onCancel: () => void;
}> = ({ onScan, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const handleDecode = useCallback(async (data: string) => {
    const assetId = parseAssetIdFromQrData(data);
    if (!assetId) return;
    if (lastScannedRef.current === assetId) return;
    lastScannedRef.current = assetId;
    setTimeout(() => { lastScannedRef.current = null; }, 2000);

    setLookingUp(true);
    setError(null);
    try {
      const asset = await fetchAssetById(assetId);
      setLookingUp(false);
      if (asset) {
        onScanRef.current(asset);
        return;
      }
      if (!API_BASE) {
        onScanRef.current({ id: assetId, name: assetId });
        return;
      }
      setError('Asset not found.');
    } catch (e) {
      setLookingUp(false);
      setError(e instanceof Error ? e.message : 'Asset not found.');
    }
  }, []);

  useEffect(() => {
    const id = 'scanner-reader';
    const config = { fps: 5, qrbox: { width: 240, height: 240 } };
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras?.length) {
          setError('No camera found.');
          return;
        }
        const scanner = new Html5Qrcode(id);
        scannerRef.current = scanner;
        scanner.start({ facingMode: 'environment' }, config, (decodedText) => handleDecode(decodedText), () => {});
      })
      .catch(() => setError('Camera access denied.'));

    return () => {
      if (scannerRef.current?.isScanning()) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [handleDecode]);

  return (
    <div className="relative h-full bg-black overflow-hidden flex flex-col">
      <div className="flex-1 flex items-center justify-center relative min-h-0">
        <div id="scanner-reader" className="w-full max-w-[min(100%,320px)]" />
        {error && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6">
            <p className="text-white font-semibold text-center mb-4">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl font-semibold"
            >
              Try again
            </button>
          </div>
        )}
        {lookingUp && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white mt-3 text-sm">Looking up asset...</p>
          </div>
        )}
        <div className="absolute bottom-24 left-0 right-0 text-center px-6 pointer-events-none">
          <h3 className="text-white font-bold text-lg mb-1">Scanning Asset QR Code</h3>
          <p className="text-slate-400 text-sm">Align the QR code within the frame.</p>
        </div>
      </div>
      <div className="bg-slate-900/80 backdrop-blur-md p-8 flex items-center justify-between safe-bottom">
        <button type="button" className="p-4 bg-white/10 rounded-full text-white" aria-label="Flash" />
        <button
          type="button"
          onClick={onCancel}
          className="p-4 bg-white/10 rounded-full text-white"
          aria-label="Cancel"
        >
          <Icons.X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
