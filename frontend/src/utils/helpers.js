export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getSeverityColor = (severity) => {
  const colors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[severity] || colors.low;
};

export const getStatusColor = (status) => {
  const colors = {
    reported: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    investigating: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return colors[status] || colors.reported;
};

export const getCategoryIcon = (category) => {
  const icons = {
    fire: 'Flame',
    flood: 'Droplets',
    earthquake: 'TriangleAlert',
    medical: 'Heart',
    crime: 'Shield',
    accident: 'Car',
    hazard: 'AlertTriangle',
    infrastructure: 'Building',
    other: 'HelpCircle',
  };
  return icons[category] || 'HelpCircle';
};

export const getCategoryColor = (category) => {
  const colors = {
    fire: '#ef4444',
    flood: '#3b82f6',
    earthquake: '#f59e0b',
    medical: '#10b981',
    crime: '#8b5cf6',
    accident: '#f97316',
    hazard: '#eab308',
    infrastructure: '#06b6d4',
    other: '#6b7280',
  };
  return colors[category] || '#6b7280';
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
};
