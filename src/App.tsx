import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginForm } from './components/LoginForm';
import { DatabaseDashboard } from './pages/DatabaseDashboard';
import { MatriculaDetail } from './pages/MatriculaDetail';
import { CicaAnalytics } from './pages/CicaAnalytics';
import { FloatingNavButton } from './components/FloatingNavButton';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function DashboardLayout() {
  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-80 pb-16 lg:pb-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Routes>
            <Route path="/databases" element={<DatabaseDashboard />} />
            <Route path="/matricula/:matricula" element={<MatriculaDetail />} />
            <Route path="/analytics/cica" element={<CicaAnalytics />} />
            <Route path="/" element={<Navigate to="/databases" replace />} />
          </Routes>
        </div>
      </div>
      <FloatingNavButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen bg-slate-50">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;