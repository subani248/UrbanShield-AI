import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../ui/Loading';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen animated-gradient">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:ml-64 p-4 lg:p-8 pb-20 lg:pb-8 min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width, 256px)' }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
