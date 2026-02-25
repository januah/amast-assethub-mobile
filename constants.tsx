
import React from 'react';
import { 
  AlertCircle, 
  Settings, 
  Calendar, 
  ClipboardList, 
  Truck, 
  User, 
  Search, 
  Bell, 
  CheckCircle2, 
  Clock, 
  XCircle,
  QrCode,
  ArrowRight,
  ChevronRight,
  Plus,
  Phone,
  Navigation,
  FileText,
  DollarSign,
  Briefcase,
  Repeat,
  RotateCcw,
  Package,
  History,
  Info,
  PenTool,
  UserPlus,
  FileCheck,
  ShieldCheck,
  Camera
} from 'lucide-react';

export const COLORS = {
  primary: '#0284c7',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  pending: '#3b82f6'
};

export const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Approved': 'bg-emerald-100 text-emerald-700',
  'Completed': 'bg-slate-100 text-slate-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Sent to Office': 'bg-purple-100 text-purple-700'
};

export const INSTALL_STATUS_COLORS: Record<string, string> = {
  'assigned': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'pending_ack': 'bg-purple-100 text-purple-700',
  'pending_director': 'bg-indigo-100 text-indigo-700',
  'completed': 'bg-emerald-100 text-emerald-700',
  'rejected': 'bg-red-100 text-red-700'
};

// Add missing REPLACEMENT_STATUS_COLORS to fix errors in views/ReplacementFlows.tsx and views/MechanicFlows.tsx
export const REPLACEMENT_STATUS_COLORS: Record<string, string> = {
  'Issued': 'bg-blue-100 text-blue-700',
  'In Use': 'bg-sky-100 text-sky-700',
  'Original Returned': 'bg-amber-100 text-amber-700',
  'Loaner Returned': 'bg-emerald-100 text-emerald-700',
  'Closed': 'bg-slate-100 text-slate-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'Overdue': 'bg-rose-100 text-rose-700'
};

export const Icons = {
  Breakdown: AlertCircle,
  PPM: Settings,
  Calendar: Calendar,
  List: ClipboardList,
  Truck: Truck,
  User: User,
  Search: Search,
  Bell: Bell,
  Check: CheckCircle2,
  Clock: Clock,
  X: XCircle,
  QR: QrCode,
  ArrowRight: ArrowRight,
  ChevronRight: ChevronRight,
  Plus: Plus,
  Phone: Phone,
  Navigation: Navigation,
  Report: FileText,
  Finance: DollarSign,
  Jobs: Briefcase,
  Replacement: Repeat,
  Swap: Repeat,
  Return: RotateCcw,
  Box: Package,
  History: History,
  Info: Info,
  Pen: PenTool,
  Invite: UserPlus,
  FileCheck: FileCheck,
  Shield: ShieldCheck,
  Camera: Camera
};
