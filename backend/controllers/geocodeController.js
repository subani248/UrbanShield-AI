const axios = require('axios');
const AppError = require('../utils/AppError');

exports.searchGeocode = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    if (!q) return next(new AppError('Search query is required.', 400));

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
        addressdetails: 1,
        limit,
      },
      headers: {
        'User-Agent': 'UrbanShieldAI/1.0 (emergency-response-platform)',
      },
    });

    const results = response.data.map((item) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      category: item.category,
      boundingbox: item.boundingbox,
    }));

    res.status(200).json({ success: true, results });
  } catch (error) {
    next(new AppError('Geocoding service unavailable.', 502));
  }
};

exports.reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return next(new AppError('Latitude and longitude are required.', 400));

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'UrbanShieldAI/1.0 (emergency-response-platform)',
      },
    });

    res.status(200).json({
      success: true,
      displayName: response.data.display_name,
      address: response.data.address,
      lat: parseFloat(response.data.lat),
      lon: parseFloat(response.data.lon),
    });
  } catch (error) {
    next(new AppError('Reverse geocoding service unavailable.', 502));
  }
};
