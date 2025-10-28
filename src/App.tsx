import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PlanSelectionPage from '@/pages/PlanSelectionPage';
import TrainingPlanPage from '@/pages/TrainingPlanPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import Layout from '@/components/Layout';
import { ToasterProvider } from '@/components/Toaster';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useAuth();
  return auth.user ? children : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-xl text-medium-text">Carregando...</div>
        </div>
      );
    }

    if (!user) {
        return (
             <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        )
    }

    if (user && !user.currentPlanId) {
        return (
            <Layout>
                <Routes>
                    <Route path="/select-plan" element={<PlanSelectionPage />} />
                    <Route path="*" element={<Navigate to="/select-plan" />} />
                </Routes>
            </Layout>
        )
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/plan" element={<PrivateRoute><TrainingPlanPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToasterProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
      </ToasterProvider>
    </AuthProvider>
  );
};

export default App;
