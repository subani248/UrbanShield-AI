const express = require('express');
const router = express.Router();
const {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  getActiveAlerts,
} = require('../controllers/alertController');
const { protect, restrictTo } = require('../middleware/auth');
const { createAlertValidator } = require('../validators/alertValidator');
const validate = require('../middleware/validate');

router.get('/active', protect, getActiveAlerts);
router.get('/', protect, getAlerts);
router.get('/:id', protect, getAlert);
router.post('/', protect, restrictTo('admin'), createAlertValidator, validate, createAlert);
router.put('/:id', protect, restrictTo('admin'), updateAlert);
router.delete('/:id', protect, restrictTo('admin'), deleteAlert);

module.exports = router;
