import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Agentation } from 'agentation';
import AppLayout from './components/layout/AppLayout';
import { PageLoader } from './components/ui/Loading';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/landing/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Incidents = lazy(() => import('./pages/incidents/Incidents'));
const IncidentDetail = lazy(() => import('./pages/incidents/IncidentDetail'));
const Alerts = lazy(() => import('./pages/alerts/Alerts'));
const MapPage = lazy(() => import('./pages/map/MapPage'));
const Users = lazy(() => import('./pages/users/Users'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
          </Route>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AnimatePresence>
      {import.meta.env.DEV && <Agentation />}
    </Suspense>
  );
}
