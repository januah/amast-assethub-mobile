
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { MobileContainer, Header, BottomNav } from './components/Layout';
import { Login, Register, VerificationStatus } from './views/Auth';
import { RequesterDashboard } from './views/RequesterDashboard';
import { AmbulanceDashboard } from './views/AmbulanceDashboard';
import { ExecutorDashboard } from './views/ExecutorDashboard';
import { ApproverDashboard } from './views/ApproverDashboard';
import { AdminHospitalDashboard } from './views/AdminHospitalDashboard';
import { BreakdownFlow } from './views/BreakdownFlow';
import { ExecutionFlow } from './views/ExecutionFlow';
import { AssetList } from './views/AssetList';
import { RecordsView } from './views/RecordsView';
import { PPMFlow } from './views/PPMFlow';
import { NotificationList, Notification } from './views/NotificationList';
import { Scanner } from './views/Scanner';
import { TowingFlow, RemovalFlow, QuotationForm } from './views/JobFlows';
import { EditProfile, NotificationSettings, ChangePassword } from './views/ProfileFlows';
import { TaskList } from './views/TaskList';
import { AdminReviewFlow } from './views/AdminReviewFlow';
import { ApprovalList } from './views/ApprovalList';
import { StaffManagement, FinanceManagement, ReportsAnalytics, AuditLogs } from './views/AdminFunctions';
import { ApprovalCalendar } from './views/ApprovalCalendar';
import { TemporaryReplacementsList, ReplacementCaseDetail, IssueReplacementWizard } from './views/ReplacementFlows';
import { MechanicDashboard, MechanicJobDetail, MechanicHistory } from './views/MechanicFlows';
import { ChecklistRunScreen } from './views/ChecklistFlow';
import { InstallerDashboard } from './views/InstallerDashboard';
import { InstallationFlow } from './views/InstallationFlow';
import { Icons } from './constants';

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'Request Approved', desc: 'Your breakdown request for WMX-4821 has been approved.', type: 'success', time: '2m ago', read: false },
  { id: 2, title: 'Job Assigned', desc: 'New towing task: Navigate to KL Sentral for pickup.', type: 'info', time: '15m ago', read: false },
  { id: 3, title: 'PPM Reminder', desc: 'Ward 4B device maintenance is scheduled for tomorrow.', type: 'warning', time: '1h ago', read: false },
  { id: 4, title: 'Invoice Ready', desc: 'Monthly service report for October is now available.', type: 'info', time: '5h ago', read: true },
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.AUTH);
  const [authState, setAuthState] = useState<'login' | 'register' | 'verifying'>('login');
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [profileSubPage, setProfileSubPage] = useState<string | null>(null);
  const [reportAsset, setReportAsset] = useState<{ id: string, name: string } | null>(null);
  const [selectedReplacementId, setSelectedReplacementId] = useState<string | null>(null);
  const [currentMechanicJobId, setCurrentMechanicJobId] = useState<string | null>(null);
  const [selectedInstallationId, setSelectedInstallationId] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setActiveTab('home');
    setCurrentFlow(null);
  };

  const handleAction = (action: string) => {
    const tabIds = ['home', 'assets', 'scan', 'records', 'profile', 'history', 'notifications_tab', 'pending_tab', 'users_tab'];
    if (tabIds.includes(action)) {
      setActiveTab(action);
      setCurrentFlow(null);
      setProfileSubPage(null);
      setReportAsset(null);
    } else {
      setCurrentFlow(action);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearOneNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderContent = () => {
    if (role === UserRole.AUTH) {
      if (authState === 'login') return <Login onLogin={handleLogin} onGoToRegister={() => setAuthState('register')} />;
      if (authState === 'register') return <Register onComplete={() => setAuthState('verifying')} onBack={() => setAuthState('login')} />;
      if (authState === 'verifying') return <VerificationStatus onDone={() => setAuthState('login')} />;
    }

    if (currentFlow === 'installation_detail' && selectedInstallationId) {
      return <InstallationFlow serviceId={selectedInstallationId} onBack={() => setCurrentFlow(null)} />;
    }

    if (currentFlow === 'checklist_flow') {
       return <ChecklistRunScreen onBack={() => {
         if (activeTab === 'records') setCurrentFlow(null);
         else setCurrentFlow('job_detail');
       }} />;
    }

    if (currentFlow === 'replacement_list') {
      return (
        <TemporaryReplacementsList 
          role={role} 
          onBack={() => setCurrentFlow(null)} 
          onSelectCase={(id) => { setSelectedReplacementId(id); setCurrentFlow('replacement_detail'); }}
          onIssueNew={() => setCurrentFlow('issue_replacement')}
        />
      );
    }

    if (currentFlow === 'replacement_detail' && selectedReplacementId) {
      return (
        <ReplacementCaseDetail 
          caseId={selectedReplacementId} 
          role={role} 
          onBack={() => setCurrentFlow('replacement_list')}
          onUpdateReturn={() => {}}
          onSwap={() => {}}
          onReturn={() => {}}
          onClose={() => {}}
          onAcknowledge={() => {}}
        />
      );
    }

    if (currentFlow === 'issue_replacement') {
      return <IssueReplacementWizard onComplete={() => setCurrentFlow('replacement_list')} onCancel={() => setCurrentFlow('replacement_list')} />;
    }

    if (currentFlow === 'admin_approval_list' || activeTab === 'pending_tab') {
      return (
        <ApprovalList 
          onBack={() => { setCurrentFlow(null); setActiveTab('home'); }} 
          onSelectItem={(id) => setCurrentFlow('admin_review')} 
        />
      );
    }

    if (currentFlow === 'admin_review') {
      return <AdminReviewFlow requestId="REQ-1209" onComplete={() => setCurrentFlow(null)} onBack={() => { setCurrentFlow(null); }} />;
    }

    if (currentFlow === 'admin_staff' || activeTab === 'users_tab' || currentFlow === 'manage_users') return <StaffManagement onBack={() => { setCurrentFlow(null); setActiveTab('home'); }} />;
    if (currentFlow === 'admin_finance') return <FinanceManagement onBack={() => setCurrentFlow(null)} />;
    if (currentFlow === 'admin_reports') return <ReportsAnalytics onBack={() => setCurrentFlow(null)} />;
    if (currentFlow === 'admin_audit') return <ApprovalCalendar onBack={() => setCurrentFlow(null)} onSelectItem={(id) => setCurrentFlow('admin_review')} />;

    if (currentFlow === 'breakdown_flow') {
      return (
        <BreakdownFlow 
          initialAsset={reportAsset}
          onComplete={() => { setCurrentFlow(null); setReportAsset(null); }} 
          onCancel={() => { setCurrentFlow(null); setReportAsset(null); }} 
        />
      );
    }
    if (currentFlow === 'ppm_list') return <PPMFlow onComplete={() => setCurrentFlow(null)} onCancel={() => setCurrentFlow(null)} />;
    
    if (currentFlow === 'task_list') {
      return (
        <TaskList 
          role={role} 
          onBack={() => setCurrentFlow(null)} 
          onSelectTask={(id) => setCurrentFlow('job_detail')} 
        />
      );
    }
    
    if (currentFlow === 'job_detail') {
      if (role === UserRole.MECHANIC || role === UserRole.HEAD_MECHANIC) {
        return (
          <MechanicJobDetail 
            jobId={currentMechanicJobId || 'JOB-MECH-4821'} 
            onBack={() => setCurrentFlow(null)}
            onComplete={() => setCurrentFlow(null)}
          />
        );
      }
      return (
        <ExecutionFlow 
          role={role} 
          onComplete={() => setCurrentFlow(null)} 
          onCancel={() => setCurrentFlow('task_list')} 
          onOpenChecklist={() => setCurrentFlow('checklist_flow')}
        />
      );
    }

    if (currentFlow === 'notifications' || activeTab === 'notifications_tab') return (
      <NotificationList 
        notifications={notifications} 
        onBack={() => { setCurrentFlow(null); setActiveTab('home'); }} 
        onMarkAllRead={markAllAsRead}
        onClearOne={clearOneNotification}
      />
    );
    if (currentFlow === 'towing') return <TowingFlow onComplete={() => setCurrentFlow(null)} />;
    if (currentFlow === 'removal') return <RemovalFlow onComplete={() => setCurrentFlow(null)} />;
    if (currentFlow === 'quotation') return <QuotationForm onComplete={() => setCurrentFlow(null)} />;

    if (activeTab === 'scan') return <Scanner onScan={() => handleAction('assets')} onCancel={() => handleAction('home')} />;
    if (activeTab === 'assets') return (
      <AssetList 
        role={role} 
        onBack={() => handleAction('home')} 
        onReportIssue={(asset) => {
          setReportAsset(asset);
          setCurrentFlow('breakdown_flow');
        }}
      />
    );
    if (activeTab === 'records') return <RecordsView onOpenChecklist={() => setCurrentFlow('checklist_flow')} />;
    if (activeTab === 'history') {
      if (role === UserRole.MECHANIC || role === UserRole.HEAD_MECHANIC) {
        return <MechanicHistory onSelectJob={(id) => { setCurrentMechanicJobId(id); setCurrentFlow('job_detail'); }} />;
      }
      return <RecordsView onOpenChecklist={() => setCurrentFlow('checklist_flow')} />;
    }
    
    if (activeTab === 'profile') {
      if (profileSubPage === 'edit_profile') return <EditProfile onBack={() => setProfileSubPage(null)} />;
      if (profileSubPage === 'notifications') return <NotificationSettings onBack={() => setProfileSubPage(null)} />;
      if (profileSubPage === 'password') return <ChangePassword onBack={() => setProfileSubPage(null)} />;

      return (
        <div className="flex flex-col h-full bg-slate-50">
          <Header title="My Profile" onNotificationClick={() => handleAction('notifications')} unreadCount={unreadCount} />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col items-center mt-6 mb-8">
              <div className="w-24 h-24 bg-sky-600 rounded-3xl mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-sky-100 uppercase">
                {role.substring(0, 2)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">Ahmad Kamal</h2>
              <p className="text-sm text-slate-500 uppercase font-bold tracking-widest mt-1">{role.replace('_', ' ')}</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => setProfileSubPage('edit_profile')} className="w-full p-4 bg-white rounded-2xl border border-slate-200 text-left flex items-center gap-3 active:bg-slate-50">
                <Icons.User className="w-5 h-5 text-slate-400" /> <span className="text-sm font-bold">Edit Profile</span>
              </button>
              <button onClick={() => setProfileSubPage('notifications')} className="w-full p-4 bg-white rounded-2xl border border-slate-200 text-left flex items-center gap-3 active:bg-slate-50">
                <Icons.Bell className="w-5 h-5 text-slate-400" /> <span className="text-sm font-bold">Notifications Settings</span>
              </button>
              <button onClick={() => setProfileSubPage('password')} className="w-full p-4 bg-white rounded-2xl border border-slate-200 text-left flex items-center gap-3 active:bg-slate-50">
                <Icons.Check className="w-5 h-5 text-slate-400" /> <span className="text-sm font-bold">Change Password</span>
              </button>
              <button onClick={() => setRole(UserRole.AUTH)} className="w-full p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-left flex items-center gap-3 mt-10 active:scale-95 transition-transform">
                <Icons.X className="w-5 h-5" /> <span className="text-sm font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (role) {
      case UserRole.MEDICAL_OFFICER:
      case UserRole.VIEWER:
        return <RequesterDashboard onAction={(act) => handleAction(act)} unreadCount={unreadCount} />;
      case UserRole.AMBULANCE_DRIVER:
        return <AmbulanceDashboard onAction={handleAction} />;
      case UserRole.MECHANIC:
      case UserRole.HEAD_MECHANIC:
        return <MechanicDashboard onSelectJob={(id) => { setCurrentMechanicJobId(id); setCurrentFlow('job_detail'); }} />;
      case UserRole.ADMIN_HOSPITAL:
      case UserRole.SUPERADMIN:
        return <AdminHospitalDashboard onAction={(act) => handleAction(act)} />;
      case UserRole.HOSPITAL_APPROVER:
        return <ApproverDashboard onAction={(act) => handleAction(act)} />;
      case UserRole.INSTALLER:
        return <InstallerDashboard onSelect={(id) => { setSelectedInstallationId(id); setCurrentFlow('installation_detail'); }} />;
      case UserRole.BIOMEDICAL_ENGINEER:
      case UserRole.TOW_TRUCK:
        return <ExecutorDashboard role={role} onAction={handleAction} unreadCount={unreadCount} />;
      default:
        return <Login onLogin={handleLogin} onGoToRegister={() => setAuthState('register')} />;
    }
  };

  const renderNav = () => {
    let tabs = [
      { id: 'home', icon: 'Jobs', label: 'Home' },
      { id: 'assets', icon: 'List', label: 'Assets' },
      { id: 'scan', icon: 'QR', label: 'Scan', special: true },
      { id: 'records', icon: 'Report', label: 'Records' },
      { id: 'profile', icon: 'User', label: 'Profile' },
    ];

    if (role === UserRole.MECHANIC || role === UserRole.HEAD_MECHANIC || role === UserRole.INSTALLER) {
      tabs = [
        { id: 'home', icon: 'Jobs', label: 'Jobs' },
        { id: 'history', icon: 'History', label: 'History' },
        { id: 'notifications_tab', icon: 'Bell', label: 'Alerts' },
        { id: 'profile', icon: 'User', label: 'Profile' },
      ];
    } else if (role === UserRole.ADMIN_HOSPITAL || role === UserRole.SUPERADMIN) {
      tabs = [
        { id: 'home', icon: 'Jobs', label: 'Dashboard' },
        { id: 'users_tab', icon: 'User', label: 'Users' },
        { id: 'assets', icon: 'List', label: 'Inventory' },
        { id: 'records', icon: 'Report', label: 'History' },
        { id: 'profile', icon: 'User', label: 'Profile' },
      ];
    } else if (role === UserRole.HOSPITAL_APPROVER) {
      tabs = [
        { id: 'home', icon: 'Jobs', label: 'Dashboard' },
        { id: 'pending_tab', icon: 'Check', label: 'Pending' },
        { id: 'records', icon: 'Report', label: 'Records' },
        { id: 'profile', icon: 'User', label: 'Profile' },
      ];
    }

    return (
      <nav className="sticky bottom-0 z-20 bg-white border-t border-slate-200 safe-bottom flex items-center justify-around px-2 py-1">
        {tabs.map((tab: any) => {
          const Icon = Icons[tab.icon as keyof typeof Icons] || Icons.Jobs;
          const isActive = activeTab === tab.id;

          if (tab.special) {
            return (
              <button key={tab.id} onClick={() => handleAction(tab.id)} className="relative -top-5 flex flex-col items-center">
                <div className="w-14 h-14 bg-sky-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-slate-50">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="mt-1 text-[10px] font-medium text-sky-600">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleAction(tab.id)}
              className={`flex flex-col items-center py-1 flex-1 transition-colors ${
                isActive ? 'text-sky-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="mt-1 text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  };

  const showNav = role !== UserRole.AUTH && !currentFlow;

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
      {showNav && renderNav()}
    </MobileContainer>
  );
};

export default App;
