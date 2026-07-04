import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus, Filter, Search, AlertTriangle, MapPin, Calendar,
  ArrowUpDown, MoreHorizontal, Eye, Trash2, CheckCircle, Crosshair
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { incidentAPI, geocodeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { PageLoader } from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { formatDate, getSeverityColor, getStatusColor, capitalize } from '../../utils/helpers';
import { cn } from '../../utils/cn';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Incidents() {
  const { user } = useAuth();
  const socket = useSocket();
  const { toasts, addToast, removeToast } = useToast();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ category: '', severity: '', status: '', page: 1 });
  const [pagination, setPagination] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'other', severity: 'medium',
    latitude: '', longitude: '', address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const canCreate = user?.role === 'citizen';
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapUserLocation, setMapUserLocation] = useState(null);
  const [mapSearch, setMapSearch] = useState('');
  const [mapSearching, setMapSearching] = useState(false);
  const [mapResults, setMapResults] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setMapUserLocation(loc);
          setMapCenter(loc);
        },
        () => {}
      );
    }
  }, []);

  function MapClickHandler() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        try {
          const res = await geocodeAPI.reverse(lat, lng);
          setForm(prev => ({ ...prev, address: res.data.displayName || `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
        } catch {
          setForm(prev => ({ ...prev, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
        }
      },
    });
    return null;
  }

  function MapFlyTo({ center }) {
    const map = useMap();
    useEffect(() => { if (center) map.flyTo(center, 13, { duration: 1 }); }, [center, map]);
    return null;
  }

  const handleMapSearch = async () => {
    if (!mapSearch.trim()) return;
    setMapSearching(true);
    try {
      const res = await geocodeAPI.search(mapSearch);
      setMapResults(res.data.results);
    } catch {} finally { setMapSearching(false); }
  };

  const handleMapSelectResult = (result) => {
    setMapCenter([result.lat, result.lon]);
    setForm(prev => ({ ...prev, latitude: result.lat.toFixed(6), longitude: result.lon.toFixed(6), address: result.displayName?.split(',')[0] || '' }));
    setMapResults([]);
    setMapSearch(result.displayName?.split(',')[0] || '');
  };

  const fetchIncidents = async (page = 1) => {
    try {
      setLoading(true);
      const params = { ...filters, page, limit: 10 };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await incidentAPI.getAll(params);
      setIncidents(res.data.incidents);
      setPagination(res.data.pagination);
    } catch (err) {
      addToast('Failed to load incidents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, [filters.category, filters.severity, filters.status]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchIncidents(filters.page);
    ['incident:created', 'incident:updated', 'incident:resolved', 'incident:deleted'].forEach(e => socket.on(e, handler));
    return () => ['incident:created', 'incident:updated', 'incident:resolved', 'incident:deleted'].forEach(e => socket.off(e, handler));
  }, [socket, filters.page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await incidentAPI.create(form);
      addToast('Incident created successfully', 'success');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'other', severity: 'medium', latitude: '', longitude: '', address: '' });
      fetchIncidents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create incident', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await incidentAPI.resolve(id);
      addToast('Incident resolved', 'success');
      fetchIncidents();
    } catch { addToast('Failed to resolve incident', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    try {
      await incidentAPI.delete(id);
      addToast('Incident deleted', 'success');
      fetchIncidents();
    } catch { addToast('Failed to delete incident', 'error'); }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Incidents</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track all emergency incidents</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilter(!showFilter)} className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          {canCreate && (
            <button onClick={() => setShowModal(true)} className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Incident
            </button>
          )}
        </div>
      </div>

      {showFilter && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
          <div className="flex flex-wrap gap-3">
            <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="input-field !py-2 text-sm max-w-[160px]">
              <option value="">All Categories</option>
              {['fire','flood','earthquake','medical','crime','accident','hazard','infrastructure','other'].map(c => (
                <option key={c} value={c}>{capitalize(c)}</option>
              ))}
            </select>
            <select value={filters.severity} onChange={e => setFilters({ ...filters, severity: e.target.value, page: 1 })}
              className="input-field !py-2 text-sm max-w-[140px]">
              <option value="">All Severities</option>
              {['low','medium','high','critical'].map(s => (
                <option key={s} value={s}>{capitalize(s)}</option>
              ))}
            </select>
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="input-field !py-2 text-sm max-w-[150px]">
              <option value="">All Statuses</option>
              {['reported','investigating','in_progress','resolved','closed'].map(s => (
                <option key={s} value={s}>{capitalize(s)}</option>
              ))}
            </select>
            <button onClick={() => { setFilters({ category: '', severity: '', status: '', page: 1 }); }} className="btn-secondary !px-3 !py-2 text-sm">Clear</button>
          </div>
        </motion.div>
      )}

      {loading ? <PageLoader /> : (
        <>
          {incidents.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No Incidents Found</h3>
              <p className="text-gray-400 mb-4">No incidents match your current filters.</p>
              {canCreate && (
                <button onClick={() => setShowModal(true)} className="btn-primary">Report an Incident</button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <motion.div key={incident._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 lg:p-6 hover:border-primary-500/20 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', getSeverityColor(incident.severity))}>
                          {capitalize(incident.severity)}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', getStatusColor(incident.status))}>
                          {capitalize(incident.status)}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium border border-gray-700/50 text-gray-400">
                          {capitalize(incident.category)}
                        </span>
                      </div>
                      <Link to={`/incidents/${incident._id}`} className="text-lg font-semibold hover:text-neon-cyan transition-colors">
                        {incident.title}
                      </Link>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{incident.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {incident.address?.substring(0, 50)}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(incident.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link to={`/incidents/${incident._id}`} className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </Link>
                      {user?.role === 'admin' && incident.status !== 'resolved' && (
                        <button onClick={() => handleResolve(incident._id)} className="p-2 hover:bg-green-500/10 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(incident._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchIncidents(p)}
                  className={cn('w-10 h-10 rounded-xl text-sm font-medium transition-all',
                    p === pagination.page ? 'bg-primary-500 text-white' : 'glass hover:bg-gray-800/50 text-gray-400'
                  )}
                >{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report New Incident">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                {['fire','flood','earthquake','medical','crime','accident','hazard','infrastructure','other'].map(c => (
                  <option key={c} value={c}>{capitalize(c)}</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={mapSearch} onChange={e => setMapSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMapSearch()}
                  className="input-field !pl-10 !py-2 text-sm" placeholder="Search location..." />
                {mapResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl max-h-36 overflow-y-auto z-[1000]">
                    {mapResults.map((r, i) => (
                      <button key={i} onClick={() => handleMapSelectResult(r)}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800/50 transition-colors flex items-start gap-2">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-500" />
                        <span className="line-clamp-1">{r.displayName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => { if (mapUserLocation) setMapCenter(mapUserLocation); }}
                className="btn-secondary !px-3 !py-2 text-sm" title="Current location">
                <Crosshair className="w-4 h-4" />
              </button>
              <button onClick={handleMapSearch} disabled={mapSearching}
                className="btn-primary !px-3 !py-2 text-sm">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[200px] rounded-xl overflow-hidden border border-gray-700/50">
              <MapContainer center={mapCenter} zoom={10} className="h-full w-full" zoomControl={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapFlyTo center={mapCenter} />
                <MapClickHandler />
                {form.latitude && form.longitude && (
                  <Marker position={[parseFloat(form.latitude), parseFloat(form.longitude)]} />
                )}
                {mapUserLocation && (
                  <Marker position={mapUserLocation} icon={L.divIcon({
                    className: 'user-marker',
                    html: '<div style="width:12px;height:12px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(59,130,246,0.5);"></div>',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                  })} />
                )}
              </MapContainer>
            </div>
            {form.latitude && form.longitude && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
            <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" required />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating...' : 'Create Incident'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
