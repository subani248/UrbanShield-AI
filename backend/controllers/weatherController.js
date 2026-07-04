const axios = require('axios');
const AppError = require('../utils/AppError');

exports.getWeather = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return next(new AppError('Latitude and longitude are required.', 400));

    const [weatherRes, forecastRes, airRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
        },
      }),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          cnt: 8,
        },
      }),
      axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      weather: weatherRes.data,
      forecast: forecastRes.data,
      airQuality: airRes.data,
    });
  } catch (error) {
    next(new AppError('Failed to fetch weather data.', 502));
  }
};

exports.getWeatherByCity = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) return next(new AppError('City name is required.', 400));

    const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: { q: city, limit: 1, appid: process.env.OPENWEATHER_API_KEY },
    });

    if (!geoRes.data.length) return next(new AppError('City not found.', 404));

    const { lat, lon } = geoRes.data[0];
    const [weatherRes, forecastRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: { lat, lon, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' },
      }),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: process.env.OPENWEATHER_API_KEY, units: 'metric', cnt: 8 },
      }),
    ]);

    res.status(200).json({
      success: true,
      weather: weatherRes.data,
      forecast: forecastRes.data,
      city: geoRes.data[0],
    });
  } catch (error) {
    next(new AppError('Failed to fetch weather data.', 502));
  }
};
