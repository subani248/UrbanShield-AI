import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, Crosshair, Loader2, Plus } from 'lucide-react';
import L from 'leaflet';
import { incidentAPI, geocodeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { PageLoader } from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { formatDate, capitalize, getSeverityColor, getCategoryColor } from '../../utils/helpers';
import { cn } from '../../utils/cn';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIncidentIcon = (severity) => {
  const colors = { low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444' };
  const color = colors[severity] || '#ef4444';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:24px;height:24px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
}

function LocationMarker({ onLocationFound }) {
  useMapEvents({
    locationfound(e) { onLocationFound(e.latlng); },
  });
  return null;
}

function ClickMarker({ onMapClick }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng); },
  });
  return null;
}

export default function MapPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const { toasts, addToast, removeToast } = useToast();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [center, setCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [clickLocation, setClickLocation] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ title: '', description: '', category: 'other', severity: 'medium', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [defaultCenter] = useState([40.7128, -74.0060]);
  const canCreate = user?.role === 'citizen';

  const fetchIncidents = async () => {
    try {
      const res = await incidentAPI.getAll({ limit: 100 });
      setIncidents(res.data.incidents);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    ['incident:created', 'incident:updated', 'incident:deleted', 'incident:resolved'].forEach(e =>
      socket.on(e, fetchIncidents)
    );
    return () => ['incident:created', 'incident:updated', 'incident:deleted', 'incident:resolved'].forEach(e =>
      socket.off(e, fetchIncidents)
    );
  }, [socket]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await geocodeAPI.search(searchQuery);
      setSearchResults(res.data.results);
    } catch {} finally { setSearching(false); }
  }, [searchQuery]);

  const handleSelectLocation = (result) => {
    setCenter([result.lat, result.lon]);
    setSearchResults([]);
    setSearchQuery(result.displayName?.split(',')[0] || '');
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
        },
        () => {}
      );
    }
  };

  const handleLocationFound = (latlng) => {
    setUserLocation([latlng.lat, latlng.lng]);
  };

  const handleMapClick = async (latlng) => {
    setClickLocation([latlng.lat, latlng.lng]);
    try {
      const res = await geocodeAPI.reverse(latlng.lat, latlng.lng);
      setIncidentForm(prev => ({ ...prev, address: res.data.displayName || `${latlng.lat}, ${latlng.lng}` }));
    } catch {
      setIncidentForm(prev => ({ ...prev, address: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}` }));
    }
    if (canCreate) setShowIncidentModal(true);
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!clickLocation) return;
    setSubmitting(true);
    try {
      await incidentAPI.create({
        ...incidentForm,
        latitude: clickLocation[0],
        longitude: clickLocation[1],
      });
      addToast('Incident reported successfully', 'success');
      setShowIncidentModal(false);
      setClickLocation(null);
      setIncidentForm({ title: '', description: '', category: 'other', severity: 'medium', address: '' });
      fetchIncidents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to report incident', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Map View</h1>
        <p className="text-gray-400 text-sm mt-1">Interactive city map with live incident tracking</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field !pl-10 !py-2 text-sm"
              placeholder="Search city or address..."
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl max-h-48 overflow-y-auto z-[1000]">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => handleSelectLocation(r)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                    <span className="line-clamp-2">{r.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSearch} disabled={searching} className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
          <button onClick={handleGetCurrentLocation} className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2">
            <Crosshair className="w-4 h-4" /> My Location
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-2 h-[600px] overflow-hidden rounded-2xl"
      >
        <MapContainer center={defaultCenter} zoom={12} className="h-full w-full rounded-xl" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={center} />
          <LocationMarker onLocationFound={handleLocationFound} />
          <ClickMarker onMapClick={handleMapClick} />

          <div className="leaflet-top leaflet-right">
            <div className="leaflet-control leaflet-bar">
              <button onClick={() => {}} className="leaflet-control-zoom-in" title="Zoom in">+</button>
              <button onClick={() => {}} className="leaflet-control-zoom-out" title="Zoom out">-</button>
            </div>
          </div>

          {incidents.map((incident) => (
            incident.location?.coordinates && (
              <Marker
                key={incident._id}
                position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
                icon={createIncidentIcon(incident.severity)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', getSeverityColor(incident.severity))}>
                        {capitalize(incident.severity)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-gray-700 text-gray-300">
                        {capitalize(incident.status)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{incident.title}</h4>
                    <p className="text-xs text-gray-400 mb-1">{incident.description?.substring(0, 100)}</p>
                    <p className="text-xs text-gray-500">{incident.address}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(incident.createdAt)}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {userLocation && (
            <Marker position={userLocation} icon={L.divIcon({
              className: 'user-marker',
              html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
          {clickLocation && (
            <Marker position={clickLocation} icon={L.divIcon({
              className: 'click-marker',
              html: '<div style="width:20px;height:20px;background:#8b5cf6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(139,92,246,0.6);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}>
              <Popup>New incident here</Popup>
            </Marker>
          )}
        </MapContainer>
      </motion.div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <span className="text-gray-400">Legend:</span>
          {[
            { label: 'Critical', color: '#ef4444' },
            { label: 'High', color: '#f97316' },
            { label: 'Medium', color: '#eab308' },
            { label: 'Low', color: '#22c55e' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              <span className="text-gray-400">{item.label}</span>
            </span>
          ))}
          <span className="flex items-center gap-1.5 ml-auto">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">{incidents.length} Incidents</span>
          </span>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Modal isOpen={showIncidentModal} onClose={() => setShowIncidentModal(false)} title="Report Incident" size="lg">
        <form onSubmit={handleSubmitIncident} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input type="text" value={incidentForm.title} onChange={e => setIncidentForm({...incidentForm, title: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea value={incidentForm.description} onChange={e => setIncidentForm({...incidentForm, description: e.target.value})} className="input-field min-h-[80px]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select value={incidentForm.category} onChange={e => setIncidentForm({...incidentForm, category: e.target.value})} className="input-field">
                {['fire','flood','earthquake','medical','crime','accident','hazard','infrastructure','other'].map(c => (
                  <option key={c} value={c}>{capitalize(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Severity</label>
              <select value={incidentForm.severity} onChange={e => setIncidentForm({...incidentForm, severity: e.target.value})} className="input-field">
                {['low','medium','high','critical'].map(s => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <div className="glass rounded-xl p-3 text-sm text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-neon-cyan" />
              {clickLocation && `${clickLocation[0].toFixed(4)}, ${clickLocation[1].toFixed(4)}`} — {incidentForm.address?.substring(0, 80)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
            <input type="text" value={incidentForm.address} onChange={e => setIncidentForm({...incidentForm, address: e.target.value})} className="input-field" required />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Reporting...' : 'Report Incident'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
