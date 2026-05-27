import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import AppShell from './layouts/AppShell';
import LoginPage from './pages/LoginPage';
import CommandCenter from './pages/CommandCenter';
import ControlTower from './pages/ControlTower';
import DispatchBoard from './pages/DispatchBoard';
import AICopilot from './pages/AICopilot';
import MasterDataPage from './pages/MasterDataPage';
import ModulePage from './components/ModulePage';
import { modules } from './modules/moduleConfig';

function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const token = localStorage.getItem('opstrax_token');
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  const user = JSON.parse(localStorage.getItem('opstrax_user') ?? '{}');
  const role = String(user.role ?? '');
  const commandCenterRoles = ['Super Admin', 'Company Admin', 'Administrator', 'Fleet Manager', 'Dispatcher', 'Safety Manager', 'Compliance Manager', 'Maintenance Manager', 'Mechanic', 'Read-only Auditor'];
  const controlTowerRoles = ['Super Admin', 'Company Admin', 'Administrator', 'Fleet Manager', 'Dispatcher', 'Safety Manager', 'Compliance Manager', 'Customer Service', 'Read-only Auditor'];
  const masterDataRoles = ['Super Admin', 'Company Admin', 'Administrator', 'Fleet Manager', 'Dispatcher', 'Safety Manager', 'Compliance Manager', 'Maintenance Manager', 'Mechanic', 'Read-only Auditor'];
  if ((location.pathname === '/' || location.pathname === '/command-center') && !commandCenterRoles.includes(role)) {
    return <Navigate to={role === 'Customer' ? '/customer-eta-portal' : '/jobs-orders'} replace />;
  }
  if (location.pathname === '/control-tower' && !controlTowerRoles.includes(role)) {
    return <Navigate to={role === 'Customer' ? '/customer-eta-portal' : '/jobs-orders'} replace />;
  }
  if ((location.pathname.startsWith('/vehicles') || location.pathname.startsWith('/drivers')) && !masterDataRoles.includes(role)) {
    return <Navigate to={role === 'Customer' ? '/customer-eta-portal' : '/jobs-orders'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route index element={<CommandCenter />} />
        <Route path="command-center" element={<CommandCenter />} />
        <Route path="control-tower" element={<ControlTower />} />
        <Route path="dispatch-board" element={<DispatchBoard />} />
        <Route path="vehicles" element={<MasterDataPage mode="vehicles" />} />
        <Route path="vehicles/:id" element={<MasterDataPage mode="vehicles" />} />
        <Route path="drivers" element={<MasterDataPage mode="drivers" />} />
        <Route path="drivers/:id" element={<MasterDataPage mode="drivers" />} />
        <Route path="ai-copilot" element={<AICopilot />} />
        {modules.filter((item) => !['command-center', 'control-tower', 'dispatch-board', 'ai-copilot', 'vehicles', 'drivers'].includes(item.key)).map((module) => (
          <Route key={module.key} path={module.path.replace('/', '')} element={<ModulePage config={module} />} />
        ))}
      </Route>
    </Routes>
  );
}
