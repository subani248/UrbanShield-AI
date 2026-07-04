exports.healthCheck = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UrbanShield AI API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
