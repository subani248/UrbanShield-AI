import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { incidentAPI } from '../../services/api';
import { PageLoader } from '../../components/ui/Loading';
import { capitalize } from '../../utils/helpers';

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#eab308', '#ef4444', '#3b82f6'];
const SEVERITY_COLORS = { low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await incidentAPI.getStats();
        setData(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const monthlyChartData = (data.monthlyStats || []).reverse().map((d) => ({
    name: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d._id.month - 1]} ${d._id.year}`,
    incidents: d.count,
  }));

  const categoryChartData = (data.categoryStats || []).map((d) => ({
    name: capitalize(d._id),
    value: d.count,
  }));

  const severityChartData = (data.severityStats || []).map((d) => ({
    name: capitalize(d._id),
    value: d.count,
    color: SEVERITY_COLORS[d._id] || '#6b7280',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Emergency response statistics and trends</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold gradient-text">{data.stats?.total || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Incidents</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-green-400">{data.stats?.resolved || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Resolved</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-orange-400">{data.stats?.active || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Active</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-red-400">{data.stats?.critical || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Critical</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
            <h3 className="font-semibold">Incident Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyChartData}>
              <defs>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="incidents" stroke="#06b6d4" fill="url(#colorIncidents)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-neon-purple" />
            <h3 className="font-semibold">Incident Categories</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryChartData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold">Severity Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {severityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Status Overview</h3>
          </div>
          <div className="space-y-4">
            {(data.statusStats || []).map((s) => (
              <div key={s._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{capitalize(s._id)}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-500"
                    style={{ width: `${data.stats.total ? (s.count / data.stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
