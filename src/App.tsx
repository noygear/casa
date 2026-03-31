import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TenantDashboardPage } from './pages/TenantDashboardPage';
import { AssetManagerDashboardPage } from './pages/AssetManagerDashboardPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { VendorsPage } from './pages/VendorsPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { LandingPage } from './pages/LandingPage';
import { SLACompliancePage } from './pages/SLACompliancePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'tenant' ? <TenantDashboardPage /> :
           user?.role === 'asset_manager' ? <AssetManagerDashboardPage /> :
           <DashboardPage />}
        </ProtectedRoute>
      } />
      <Route path="/work-orders" element={<ProtectedRoute><WorkOrdersPage /></ProtectedRoute>} />
      <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
      <Route path="/properties" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
      <Route path="/sla-compliance" element={<ProtectedRoute><SLACompliancePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
