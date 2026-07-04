const express = require('express');
const router = express.Router();
const { getDashboardStats, getCitizenDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDashboardStats);
router.get('/citizen', protect, getCitizenDashboard);

module.exports = router;
