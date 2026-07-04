const express = require('express');
const router = express.Router();
const { getWeather, getWeatherByCity } = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWeather);
router.get('/city', protect, getWeatherByCity);

module.exports = router;
