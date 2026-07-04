const express = require('express');
const router = express.Router();
const { searchGeocode, reverseGeocode } = require('../controllers/geocodeController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchGeocode);
router.get('/reverse', protect, reverseGeocode);

module.exports = router;
