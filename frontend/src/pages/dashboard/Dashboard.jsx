import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Bell, Activity, Thermometer,
  Wind, Droplets, Brain, MapPin, Clock,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { dashboardAPI, weatherAPI, aiAPI, incidentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { SkeletonCard } from '../../components/ui/Loading';
import { formatDate, getSeverityColor, getStatusColor, capitalize } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export default function Dashboard() {
  const { user } = useAuth();
  const socket = useSocket();
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const isCitizen = user?.role === 'citizen';
      let statsRes, weatherRes, predictionRes, incidentsRes;

      if (isCitizen) {
        statsRes = await dashboardAPI.getCitizen();
      } else {
        statsRes = await dashboardAPI.getStats();
      }

      setStats(statsRes.data.stats || statsRes.data);
      setRecentIncidents(statsRes.data.recentIncidents || statsRes.data.myIncidents || []);

      try {
        weatherRes = await weatherAPI.getByCoords(40.7128, -74.0060);
        setWeather(weatherRes.data);
      } catch {}

      try {
        predictionRes = await aiAPI.getPrediction();
        setPrediction(predictionRes.data);
      } catch {}
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handlers = {
      'incident:created': fetchData,
      'incident:updated': fetchData,
      'incident:resolved': fetchData,
      'incident:deleted': fetchData,
      'alert:created': fetchData,
    };
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => Object.keys(handlers).forEach((event) => socket.off(event));
  }, [socket]);

  if (loading) return <DashboardSkeleton isAdmin={user?.role === 'admin'} />;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Active Incidents" value={stats?.activeIncidents || stats?.active || 0} color="text-orange-400" bg="bg-orange-500/10" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolvedIncidents || stats?.resolved || 0} color="text-green-400" bg="bg-green-500/10" />
        <StatCard icon={Bell} label={isAdmin ? "Active Alerts" : "Total Reported"} value={stats?.activeAlerts || stats?.total || 0} color="text-neon-cyan" bg="bg-neon-cyan/10" />
        <StatCard icon={Activity} label={isAdmin ? "Critical" : "Status"} value={isAdmin ? (stats?.criticalIncidents || 0) : (stats?.active || 0)} color="text-red-400" bg="bg-red-500/10" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isAdmin && prediction && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Emergency Prediction</h3>
                  <p className="text-xs text-gray-500">Powered by Gemini AI</p>
                </div>
                <div className="ml-auto">
                  <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', 
                    prediction.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    prediction.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    prediction.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-green-500/20 text-green-400 border-green-500/30'
                  )}>
                    {capitalize(prediction.riskLevel)} Risk
                  </span>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{prediction.prediction}</p>
              <div className="glass rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-neon-cyan mb-2">Recommended Response</p>
                <p className="text-sm text-gray-400">{prediction.recommendedResponse}</p>
              </div>
              {prediction.safetyTips?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Safety Tips</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.safetyTips.map((tip, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/50 text-xs text-gray-400">{tip}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Incidents</h3>
              <Link to="/incidents" className="text-sm text-neon-cyan hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No incidents reported yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIncidents.slice(0, 5).map((incident) => (
                  <Link key={incident._id} to={`/incidents/${incident._id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-800/30 transition-colors group"
                  >
                    <div className={cn('w-2 h-2 rounded-full shrink-0', 
                      incident.severity === 'critical' ? 'bg-red-500' :
                      incident.severity === 'high' ? 'bg-orange-500' :
                      incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-neon-cyan transition-colors">{incident.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.createdAt)}</p>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', getStatusColor(incident.status))}>
                      {capitalize(incident.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {weather && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-semibold">Weather</h3>
              </div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold gradient-text">
                  {Math.round(weather.weather?.main?.temp || 0)}°C
                </div>
                <p className="text-sm text-gray-400 capitalize">{weather.weather?.weather?.[0]?.description || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-sm font-medium">{weather.weather?.main?.humidity || 0}%</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <Wind className="w-4 h-4 text-neon-cyan mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Wind</p>
                  <p className="text-sm font-medium">{Math.round(weather.weather?.wind?.speed || 0)} m/s</p>
                </div>
              </div>
              {weather.airQuality?.list?.[0] && (
                <div className="mt-3 glass rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Air Quality</span>
                    <span className={cn('text-xs font-medium',
                      weather.airQuality.list[0].main?.aqi <= 2 ? 'text-green-400' :
                      weather.airQuality.list[0].main?.aqi <= 3 ? 'text-yellow-400' : 'text-red-400'
                    )}>
                      {['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][weather.airQuality.list[0].main?.aqi] || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton({ isAdmin }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-8 w-40 rounded-full" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-4 lg:p-6">
            <div className="skeleton h-10 w-10 rounded-xl mb-3" />
            <div className="skeleton h-8 w-16 mb-1" />
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isAdmin && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-32" />
                </div>
                <div className="ml-auto skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="skeleton h-16 w-full mb-3" />
              <div className="glass rounded-xl p-4 mb-4">
                <div className="skeleton h-4 w-36 mb-2" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton h-5 w-36" />
              <div className="skeleton h-4 w-16" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="skeleton h-2 w-2 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="skeleton h-5 w-5" />
                <div className="skeleton h-5 w-20" />
              </div>
              <div className="text-center mb-4">
                <div className="skeleton h-10 w-24 mx-auto mb-2" />
                <div className="skeleton h-4 w-32 mx-auto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <div className="skeleton h-4 w-4 mx-auto mb-1" />
                  <div className="skeleton h-3 w-16 mx-auto mb-1" />
                  <div className="skeleton h-4 w-10 mx-auto" />
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <div className="skeleton h-4 w-4 mx-auto mb-1" />
                  <div className="skeleton h-3 w-16 mx-auto mb-1" />
                  <div className="skeleton h-4 w-10 mx-auto" />
                </div>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="skeleton h-5 w-5" />
                <div className="skeleton h-5 w-28" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-xl p-3">
                    <div className="skeleton h-4 w-3/4 mb-1" />
                    <div className="skeleton h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 lg:p-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
      </div>
      <p className="text-2xl lg:text-3xl font-bold">{value}</p>
      <p className="text-xs lg:text-sm text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}
