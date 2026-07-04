const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');
const { getIO } = require('../socket');

exports.createAlert = async (req, res, next) => {
  try {
    const { title, message, type, severity, latitude, longitude, address, expiresAt } = req.body;

    const alertData = {
      title,
      message,
      type,
      severity,
      createdBy: req.user.id,
    };

    if (latitude && longitude) {
      alertData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }
    if (address) alertData.address = address;
    if (expiresAt) alertData.expiresAt = new Date(expiresAt);

    const alert = await Alert.create(alertData);
    const populated = await Alert.findById(alert._id).populate('createdBy', 'name email');

    const io = getIO();
    if (io) io.emit('alert:created', populated);

    res.status(201).json({ success: true, alert: populated });
  } catch (error) {
    next(error);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const { type, severity, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .populate('createdBy', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Alert.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      alerts,
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

exports.getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('createdBy', 'name email');
    if (!alert) return next(new AppError('Alert not found.', 404));
    res.status(200).json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    if (!alert) return next(new AppError('Alert not found.', 404));

    const io = getIO();
    if (io) io.emit('alert:updated', alert);

    res.status(200).json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return next(new AppError('Alert not found.', 404));

    const io = getIO();
    if (io) io.emit('alert:deleted', { id: req.params.id });

    res.status(200).json({ success: true, message: 'Alert deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ status: 'active' })
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};
