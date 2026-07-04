import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { alertAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { PageLoader } from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { formatDate, capitalize } from '../../utils/helpers';
import { cn } from '../../utils/cn';

const alertIcons = { emergency: AlertCircle, warning: AlertTriangle, advisory: Info, informational: Bell };

export default function Alerts() {
  const { user } = useAuth();
  const socket = useSocket();
  const { toasts, addToast, removeToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'informational', severity: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  const canCreate = user?.role === 'admin';

  const fetchAlerts = async () => {
    try {
      const res = await alertAPI.getActive();
      setAlerts(res.data.alerts);
    } catch { addToast('Failed to load alerts', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    if (!socket) return;
    ['alert:created', 'alert:updated', 'alert:deleted'].forEach(e => socket.on(e, fetchAlerts));
    return () => ['alert:created', 'alert:updated', 'alert:deleted'].forEach(e => socket.off(e, fetchAlerts));
  }, [socket]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await alertAPI.create(form);
      addToast('Alert created', 'success');
      setShowModal(false);
      setForm({ title: '', message: '', type: 'informational', severity: 'medium' });
      fetchAlerts();
    } catch (err) { addToast(err.response?.data?.message || 'Failed to create alert', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this alert?')) return;
    try { await alertAPI.delete(id); addToast('Alert deleted', 'success'); fetchAlerts(); }
    catch { addToast('Failed to delete', 'error'); }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Alerts</h1>
          <p className="text-gray-400 text-sm mt-1">Emergency notifications and community alerts</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Alert
          </button>
        )}
      </div>

      {loading ? <PageLoader /> : alerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
          <p className="text-gray-400">There are no active alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type] || Bell;
            return (
              <motion.div key={alert._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={cn('glass-card p-4 lg:p-6 border-l-4',
                  alert.severity === 'critical' ? 'border-l-red-500' :
                  alert.severity === 'high' ? 'border-l-orange-500' :
                  alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    alert.type === 'emergency' ? 'bg-red-500/10' :
                    alert.type === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  )}>
                    <Icon className={cn('w-5 h-5',
                      alert.type === 'emergency' ? 'text-red-400' :
                      alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border',
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      )}>{capitalize(alert.severity)}</span>
                    </div>
                    <p className="text-sm text-gray-400">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>By {alert.createdBy?.name}</span>
                      <span>{formatDate(alert.createdAt)}</span>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(alert._id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 opacity-0 group-hover:opacity-100">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Alert">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="input-field min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                {['emergency','warning','advisory','informational'].map(t => (
                  <option key={t} value={t}>{capitalize(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Severity</label>
              <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="input-field">
                {['low','medium','high','critical'].map(s => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating...' : 'Create Alert'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
