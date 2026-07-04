const Incident = require('../models/Incident');
const Alert = require('../models/Alert');
const User = require('../models/User');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [incidentAgg, alertCounts, totalUsers, recentIncidents] = await Promise.all([
      Incident.aggregate([
        {
          $facet: {
            overview: [{
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] } },
                resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                critical: { $sum: { $cond: [{ $and: [{ $eq: ['$severity', 'critical'] }, { $ne: ['$status', 'resolved'] }] }, 1, 0] } },
              },
            }],
            categories: [{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
            severities: [{ $group: { _id: '$severity', count: { $sum: 1 } } }],
            monthly: [
              { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
              { $sort: { '_id.year': -1, '_id.month': -1 } },
              { $limit: 12 },
            ],
          },
        },
      ]),
      Promise.all([Alert.countDocuments(), Alert.countDocuments({ status: 'active' })]),
      User.countDocuments(),
      Incident.find().select('title description category severity status location createdAt reporter')
        .populate('reporter', 'name avatar')
        .sort('-createdAt')
        .limit(10),
    ]);

    const f = incidentAgg[0];
    const s = f.overview[0] || { total: 0, active: 0, resolved: 0, critical: 0 };
    const [totalAlerts, activeAlerts] = alertCounts;

    res.status(200).json({
      success: true,
      stats: {
        totalIncidents: s.total, activeIncidents: s.active,
        resolvedIncidents: s.resolved, criticalIncidents: s.critical,
        totalAlerts, activeAlerts, totalUsers, avgResponseTime: 0,
      },
      recentIncidents,
      categoryStats: f.categories,
      severityStats: f.severities,
      monthlyData: f.monthly,
      statusTimeline: [],
    });
  } catch (error) {
    next(error);
  }
};

exports.getCitizenDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [myIncidents, activeAlerts, userAgg] = await Promise.all([
      Incident.find({ reporter: userId }).sort('-createdAt').limit(10),
      Alert.find({ status: 'active' }).sort('-createdAt').limit(5),
      Incident.aggregate([
        { $match: { reporter: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
            active: { $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const stats = userAgg[0] || { total: 0, resolved: 0, active: 0 };

    res.status(200).json({ success: true, stats, myIncidents, activeAlerts });
  } catch (error) {
    next(error);
  }
};
