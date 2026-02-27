export const COLORS = {
  primary: '#0284c7',
  primaryDark: '#0369a1',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  pending: '#3b82f6',
  white: '#ffffff',
  amber: { 50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 800: '#92400e' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46' },
  sky: { 50: '#f0f9ff', 100: '#e0f2fe', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 800: '#075985' },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Pending': { bg: '#dbeafe', text: '#1d4ed8' },
  'In Progress': { bg: '#fef3c7', text: '#b45309' },
  'Approved': { bg: '#d1fae5', text: '#047857' },
  'Completed': { bg: '#f1f5f9', text: '#475569' },
  'Rejected': { bg: '#fee2e2', text: '#dc2626' },
  'Sent to Office': { bg: '#ede9fe', text: '#6d28d9' },
  'active': { bg: '#d1fae5', text: '#047857' },
  'inactive': { bg: '#f1f5f9', text: '#475569' },
  'ACTIVE': { bg: '#d1fae5', text: '#047857' },
  'MAINTENANCE': { bg: '#fef3c7', text: '#b45309' },
  'CALIBRATION': { bg: '#dbeafe', text: '#1d4ed8' },
  'DECOMMISSIONED': { bg: '#f1f5f9', text: '#64748b' }
};

export const INSTALL_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'assigned': { bg: '#dbeafe', text: '#1d4ed8' },
  'in_progress': { bg: '#fef3c7', text: '#b45309' },
  'pending_ack': { bg: '#ede9fe', text: '#5b21b6' },
  'pending_director': { bg: '#e0e7ff', text: '#4338ca' },
  'completed': { bg: '#d1fae5', text: '#047857' },
  'rejected': { bg: '#fee2e2', text: '#dc2626' }
};
