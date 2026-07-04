import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, User, Shield, AlertTriangle,
  Clock, CheckCircle, Trash2, Edit3, Brain
} from 'lucide-react';
import { incidentAPI, aiAPI } from '../../services/api';
import { PageLoader } from '../../components/ui/Loading';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getSeverityColor, getStatusColor, capitalize } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await incidentAPI.getById(id);
        setIncident(res.data.incident);
      } catch {
        addToast('Incident not found', 'error');
        navigate('/incidents');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleResolve = async () => {
    try {
      await incidentAPI.resolve(id);
      const res = await incidentAPI.getById(id);
      setIncident(res.data.incident);
      addToast('Incident resolved', 'success');
    } catch { addToast('Failed to resolve', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this incident?')) return;
    try {
      await incidentAPI.delete(id);
      addToast('Incident deleted', 'success');
      navigate('/incidents');
    } catch { addToast('Failed to delete', 'error'); }
  };

  const getAISummary = async () => {
    setSummarizing(true);
    try {
      const res = await aiAPI.getSummary(incident.description);
      setAiSummary(res.data);
    } catch {
      addToast('AI summary unavailable', 'error');
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!incident) return null;

  const canModify = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <button onClick={() => navigate('/incidents')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Incidents
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={cn('px-3 py-1 rounded text-xs font-medium border', getSeverityColor(incident.severity))}>
                {capitalize(incident.severity)}
              </span>
              <span className={cn('px-3 py-1 rounded text-xs font-medium border', getStatusColor(incident.status))}>
                {capitalize(incident.status)}
              </span>
              <span className="px-3 py-1 rounded text-xs font-medium border border-gray-700/50 text-gray-400">
                {capitalize(incident.category)}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{incident.title}</h1>
            <p className="text-gray-300 leading-relaxed">{incident.description}</p>
          </div>
          {canModify && (
            <div className="flex gap-2 shrink-0">
              {incident.status !== 'resolved' && (
                <button onClick={handleResolve} className="btn-primary !px-3 !py-2 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Resolve
                </button>
              )}
              {user?.role === 'admin' && (
                <button onClick={handleDelete} className="btn-danger !px-3 !py-2 text-sm flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><MapPin className="w-3 h-3" /> Location</div>
            <p className="text-sm">{incident.address}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><User className="w-3 h-3" /> Reporter</div>
            <p className="text-sm">{incident.reporter?.name || 'Unknown'}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Calendar className="w-3 h-3" /> Created</div>
            <p className="text-sm">{formatDate(incident.createdAt)}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Shield className="w-3 h-3" /> Officer</div>
            <p className="text-sm">{incident.assignedOfficer?.name || 'Unassigned'}</p>
          </div>
        </div>

        {incident.resolvedAt && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" /> Resolved at {formatDate(incident.resolvedAt)}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-neon-purple" />
            <h3 className="font-semibold">AI Analysis</h3>
          </div>
          <button onClick={getAISummary} disabled={summarizing} className="btn-secondary !px-3 !py-1.5 text-sm">
            {summarizing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>
        {aiSummary ? (
          <div className="space-y-3">
            <p className="text-gray-300">{aiSummary.summary}</p>
            <div className="flex flex-wrap gap-2">
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium border',
                aiSummary.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                aiSummary.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              )}>Priority: {capitalize(aiSummary.priority)}</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium border border-gray-700/50 text-gray-400">
                Category: {capitalize(aiSummary.suggestedCategory)}
              </span>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-sm text-neon-cyan font-medium mb-1">Recommended Action</p>
              <p className="text-sm text-gray-400">{aiSummary.recommendedAction}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Click "Analyze with AI" to get an AI-powered analysis of this incident.</p>
        )}
      </motion.div>
    </div>
  );
}
