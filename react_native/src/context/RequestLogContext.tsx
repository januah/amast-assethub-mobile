import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getRequestLogs, subscribe, type RequestLogEntry } from '../store/requestLogStore';

interface RequestLogContextValue {
  logs: RequestLogEntry[];
  showScreen: boolean;
  setShowScreen: (v: boolean) => void;
}

const RequestLogContext = createContext<RequestLogContextValue | null>(null);

export function RequestLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<RequestLogEntry[]>(getRequestLogs());
  const [showScreen, setShowScreen] = useState(false);

  const refresh = useCallback(() => setLogs(getRequestLogs()), []);

  useEffect(() => {
    return subscribe(refresh);
  }, [refresh]);

  return (
    <RequestLogContext.Provider value={{ logs, showScreen, setShowScreen }}>
      {children}
    </RequestLogContext.Provider>
  );
}

export function useRequestLog() {
  const ctx = useContext(RequestLogContext);
  if (!ctx) throw new Error('useRequestLog must be used within RequestLogProvider');
  return ctx;
}
