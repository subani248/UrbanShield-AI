const express = require('express');
const router = express.Router();
const {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  deleteIncident,
  resolveIncident,
  getIncidentStats,
} = require('../controllers/incidentController');
const { protect, restrictTo } = require('../middleware/auth');
const { createIncidentValidator, updateIncidentValidator } = require('../validators/incidentValidator');
const validate = require('../middleware/validate');

router.get('/stats', protect, getIncidentStats);
router.get('/', protect, getIncidents);
router.get('/:id', protect, getIncident);
router.post('/', protect, restrictTo('citizen'), createIncidentValidator, validate, createIncident);
router.put('/:id', protect, restrictTo('admin'), updateIncidentValidator, validate, updateIncident);
router.delete('/:id', protect, restrictTo('admin'), deleteIncident);
router.patch('/:id/resolve', protect, restrictTo('admin'), resolveIncident);

module.exports = router;
