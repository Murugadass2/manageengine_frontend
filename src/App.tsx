import React from 'react';
import { BrowserRouter, Routes, Route, useOutletContext } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { TicketList } from './pages/TicketList';
import { TicketDetails } from './pages/TicketDetails';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { AssetManagement } from './pages/AssetManagement';
import { InventoryManagement } from './pages/InventoryManagement';
import { MaintenanceSchedulePage } from './pages/MaintenanceSchedulePage';
import { ApprovalWorkflowPage } from './pages/ApprovalWorkflowPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TechniciansPage } from './pages/TechniciansPage';
import { EmployeeManagementPage } from './pages/EmployeeManagementPage';

const TicketListWrapper: React.FC<{ myTasksOnly?: boolean }> = ({ myTasksOnly }) => {
  const { onOpenCreateTicket } = useOutletContext<{ onOpenCreateTicket: () => void }>();
  return <TicketList onOpenCreateTicket={onOpenCreateTicket} myTasksOnly={myTasksOnly} />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketListWrapper />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/my-tasks" element={<TicketListWrapper myTasksOnly={true} />} />
            <Route path="/departments" element={<DepartmentManagement />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/assets" element={<AssetManagement />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/maintenance" element={<MaintenanceSchedulePage />} />
            <Route path="/approvals" element={<ApprovalWorkflowPage />} />
            <Route path="/kb" element={<KnowledgeBasePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/employees" element={<EmployeeManagementPage />} />
            <Route path="/sla" element={<SettingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
