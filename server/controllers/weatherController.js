const { getWeatherData } = require('../services/weatherService');

// @desc    Get current weather & agricultural risk alerts
// @route   GET /api/weather
// @access  Public
const getWeather = async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon) : undefined;
    const city = req.query.city || req.query.location || '';

    const data = await getWeatherData({ lat, lon, city });

    res.json({
      success: true,
      weather: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving weather intelligence'
    });
  }
};

module.exports = {
  getWeather
};
