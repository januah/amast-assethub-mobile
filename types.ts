
export enum UserRole {
  MEDICAL_OFFICER = 'medical_officer',
  AMBULANCE_DRIVER = 'driver_ambulance',
  BIOMEDICAL_ENGINEER = 'biomedical_engineer',
  HEAD_MECHANIC = 'head_of_mechanic',
  MECHANIC = 'mechanic',
  TOW_TRUCK = 'tow_truck',
  HOSPITAL_APPROVER = 'approver',
  ADMIN_HOSPITAL = 'admin_hospital',
  SUPERADMIN = 'superadmin',
  INSTALLER = 'installer',
  AUTH = 'auth',
  VIEWER = 'viewer'
}

export type ChecklistResponseType = 'yesno' | 'passfail' | 'numeric' | 'text' | 'single_choice' | 'multiple_choice' | 'date';

export interface QuestionnaireAnswer {
  value?: any;
  notes?: string;
  photos?: { fileId: string; url: string; caption?: string; status: 'uploading' | 'synced' | 'error' }[];
  isNA?: boolean;
  naReason?: string;
}

export interface Questionnaire {
  id: string;
  text: string;
  helpText?: string;
  responseType: ChecklistResponseType;
  required: boolean;
  evidenceRequired: boolean;
  notesAllowed: boolean;
  config?: {
    min?: number;
    max?: number;
    unit?: string;
    choices?: { value: string; label: string }[];
  };
  answer: QuestionnaireAnswer;
}

export interface ChecklistSection {
  id: string;
  title: string;
  instructionNotes?: string;
  questionnaires: Questionnaire[];
}

// Add ChecklistRun to fix the error in views/ChecklistFlow.tsx
export interface ChecklistRun {
  id: string;
  status: string;
  template: { id: string; name: string; version: string };
  equipment: { id: string; name: string; model: string; serial: string };
  performedBy: string;
  startedAt: string;
  completedAt?: string;
  sections: ChecklistSection[];
}

export type InstallationStatus = 'assigned' | 'in_progress' | 'pending_ack' | 'pending_director' | 'completed' | 'rejected';
export type SignerType = 'asset_manager' | 'end_user' | 'finance_manager' | 'hospital_director';
export type SignerStatus = 'pending' | 'signed' | 'declined' | 'expired';

export interface ExternalSigner {
  type: SignerType;
  name?: string;
  contact?: string;
  status: SignerStatus;
  signedAt?: string;
  remarks?: string;
}

export interface InstallationService {
  id: string;
  docNo: string;
  status: InstallationStatus;
  asset: { tag: string; name: string; model: string; serial: string };
  hospital: { name: string; site: string; tenantId: string };
  vendor: string;
  dueDate: string;
  createdAt: string;
  checklist?: {
    runId: string;
    sections: ChecklistSection[];
  };
  acknowledgements: ExternalSigner[];
}

export type Status = 'Pending' | 'In Progress' | 'Approved' | 'Completed' | 'Rejected' | 'Sent to Office';

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  nextPpm: string;
}

export type ReplacementStatus = 'Issued' | 'In Use' | 'Original Returned' | 'Loaner Returned' | 'Closed' | 'Cancelled' | 'Overdue';

export interface ReplacementEvent {
  id: string;
  type: string;
  timestamp: string;
  user: string;
  remarks?: string;
}

export interface ReplacementCase {
  id: string;
  status: ReplacementStatus;
  serviceRequestId: string;
  originalDeviceId: string;
  originalDeviceName: string;
  loanerDeviceId: string;
  loanerDeviceName: string;
  department: string;
  pic: string;
  issuedBy: string;
  issuedDate: string;
  expectedReturn: string;
  timeline: ReplacementEvent[];
}
