const Incident = require('../models/Incident');
const AppError = require('../utils/AppError');
const { getIO } = require('../socket');

exports.createIncident = async (req, res, next) => {
  try {
    const { title, description, category, severity, latitude, longitude, address } = req.body;

    const incident = await Incident.create({
      title,
      description,
      category,
      severity,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      address,
      reporter: req.user.id,
    });

    const populated = await Incident.findById(incident._id).populate('reporter', 'name email avatar');

    const io = getIO();
    if (io) io.emit('incident:created', populated);

    res.status(201).json({ success: true, incident: populated });
  } catch (error) {
    next(error);
  }
};

exports.getIncidents = async (req, res, next) => {
  try {
    const {
      category,
      severity,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = '-createdAt',
      near,
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (req.user.role === 'citizen') {
      query.reporter = req.user.id;
    }

    if (near) {
      const [lng, lat] = near.split(',').map(Number);
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 50000,
        },
      };
    }

    const skip = (page - 1) * limit;
    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .populate('reporter', 'name email avatar')
        .populate('assignedOfficer', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Incident.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      incidents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reporter', 'name email avatar')
      .populate('assignedOfficer', 'name email');
    if (!incident) return next(new AppError('Incident not found.', 404));
    res.status(200).json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

exports.updateIncident = async (req, res, next) => {
  try {
    const allowedFields = ['title', 'description', 'category', 'severity', 'status', 'assignedOfficer'];
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) updates[key] = req.body[key];
    });

    if (updates.status === 'resolved') {
      updates.resolvedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('reporter', 'name email avatar')
      .populate('assignedOfficer', 'name email');

    if (!incident) return next(new AppError('Incident not found.', 404));

    const io = getIO();
    if (io) io.emit('incident:updated', incident);

    res.status(200).json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

exports.deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return next(new AppError('Incident not found.', 404));

    const io = getIO();
    if (io) io.emit('incident:deleted', { id: req.params.id });

    res.status(200).json({ success: true, message: 'Incident deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.resolveIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    )
      .populate('reporter', 'name email avatar')
      .populate('assignedOfficer', 'name email');

    if (!incident) return next(new AppError('Incident not found.', 404));

    const io = getIO();
    if (io) io.emit('incident:resolved', incident);

    res.status(200).json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

exports.getIncidentStats = async (req, res, next) => {
  try {
    const stats = await Incident.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Incident.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const severityStats = await Incident.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyStats = await Incident.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const total = await Incident.countDocuments();
    const active = await Incident.countDocuments({ status: { $ne: 'resolved' } });
    const resolved = await Incident.countDocuments({ status: 'resolved' });
    const critical = await Incident.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } });

    res.status(200).json({
      success: true,
      stats: { total, active, resolved, critical },
      statusStats: stats,
      categoryStats,
      severityStats,
      monthlyStats,
    });
  } catch (error) {
    next(error);
  }
};
