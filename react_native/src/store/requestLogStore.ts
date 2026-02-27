export interface RequestLogEntry {
  id: string;
  method: string;
  path: string;
  url: string;
  status?: number;
  response?: unknown;
  error?: string;
  timestamp: number;
}

const MAX_LOGS = 100;
const logs: RequestLogEntry[] = [];
const listeners = new Set<() => void>();

let idCounter = 0;

function notify() {
  listeners.forEach((cb) => cb());
}

export function addRequestLog(entry: Omit<RequestLogEntry, 'id' | 'timestamp'>) {
  const id = String(++idCounter);
  const full: RequestLogEntry = {
    ...entry,
    id,
    timestamp: Date.now(),
  };
  logs.unshift(full);
  if (logs.length > MAX_LOGS) logs.pop();
  notify();
}

export function getRequestLogs(): RequestLogEntry[] {
  return [...logs];
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
