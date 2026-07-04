import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, AlertTriangle, Activity, Server, Globe, Database, Settings } from 'lucide-react';
import { dashboardAPI, incidentAPI, userAPI } from '../../services/api';
import { PageLoader } from '../../components/ui/Loading';
import { capitalize } from '../../utils/helpers';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, incidentStatsRes] = await Promise.all([
          dashboardAPI.getStats(),
          incidentAPI.getStats(),
        ]);
        setStats({ ...dashboardRes.data, ...incidentStatsRes.data });
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">System Administration</h1>
        <p className="text-gray-400 text-sm mt-1">Manage UrbanShield AI system settings and monitoring</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemCard icon={Users} label="Total Users" value={stats?.stats?.totalUsers || 0} color="text-blue-400" />
        <SystemCard icon={Shield} label="Admins" value={stats?.stats?.totalUsers || 0} color="text-neon-cyan" />
        <SystemCard icon={AlertTriangle} label="Total Incidents" value={stats?.stats?.totalIncidents || 0} color="text-orange-400" />
        <SystemCard icon={Activity} label="Active Alerts" value={stats?.stats?.activeAlerts || 0} color="text-yellow-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-neon-cyan" />
            <h3 className="font-semibold">System Status</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'API Server', status: 'operational' },
              { label: 'Database', status: 'operational' },
              { label: 'AI Service', status: process.env.GEMINI_API_KEY ? 'operational' : 'not configured' },
              { label: 'Weather Service', status: process.env.OPENWEATHER_API_KEY ? 'operational' : 'not configured' },
              { label: 'WebSocket', status: 'operational' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 glass rounded-xl">
                <span className="text-sm">{item.label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.status === 'operational' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {capitalize(item.status)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-neon-purple" />
            <h3 className="font-semibold">System Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between p-3 glass rounded-xl">
              <span className="text-sm text-gray-400">Version</span>
              <span className="text-sm font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between p-3 glass rounded-xl">
              <span className="text-sm text-gray-400">Environment</span>
              <span className="text-sm font-mono">{import.meta.env.MODE}</span>
            </div>
            <div className="flex justify-between p-3 glass rounded-xl">
              <span className="text-sm text-gray-400">API URL</span>
              <span className="text-sm font-mono text-neon-cyan">{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</span>
            </div>
            <div className="flex justify-between p-3 glass rounded-xl">
              <span className="text-sm text-gray-400">User Roles</span>
              <span className="text-sm">Admin / Citizen</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold">Quick Actions</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <button onClick={() => window.location.href = '/users'} className="glass rounded-xl p-4 text-left hover:border-primary-500/30 transition-all">
            <Users className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm font-medium">Manage Users</p>
            <p className="text-xs text-gray-500 mt-1">View and manage all users</p>
          </button>
          <button onClick={() => window.location.href = '/incidents'} className="glass rounded-xl p-4 text-left hover:border-primary-500/30 transition-all">
            <AlertTriangle className="w-5 h-5 text-orange-400 mb-2" />
            <p className="text-sm font-medium">View Incidents</p>
            <p className="text-xs text-gray-500 mt-1">Manage all incidents</p>
          </button>
          <button onClick={() => window.location.href = '/analytics'} className="glass rounded-xl p-4 text-left hover:border-primary-500/30 transition-all">
            <Activity className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-sm font-medium">View Analytics</p>
            <p className="text-xs text-gray-500 mt-1">System statistics</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SystemCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
