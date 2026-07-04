const express = require('express');
const router = express.Router();
const { getAIPrediction, getAISummary } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/prediction', protect, getAIPrediction);
router.post('/summary', protect, getAISummary);

module.exports = router;
