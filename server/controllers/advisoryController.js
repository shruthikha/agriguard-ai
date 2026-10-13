const Advisory = require('../models/Advisory');
const Disease = require('../models/Disease');
const RegionalAdvisory = require('../models/RegionalAdvisory');
const { generateAdvisory } = require('../services/advisoryEngine');

// @desc    Generate on-demand smart farming advisory
// @route   POST /api/advisories/generate
// @access  Public
const generateAdvisoryHandler = async (req, res) => {
  try {
    const { crop, disease, confidence, isHealthy, weather, language = 'en' } = req.body;

    if (!crop || !disease) {
      return res.status(400).json({
        success: false,
        message: 'Crop and disease parameters are required.'
      });
    }

    const diseaseDoc = await Disease.findOne({
      crop: new RegExp(`^${crop}$`, 'i'),
      diseaseName: new RegExp(`^${disease}$`, 'i')
    });

    const advisory = generateAdvisory({
      crop,
      disease,
      confidence: confidence || 90,
      isHealthy: isHealthy !== undefined ? isHealthy : disease.toLowerCase() === 'healthy',
      weather: weather || {},
      language,
      diseaseModel: diseaseDoc
    });

    res.json({
      success: true,
      advisory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user or general advisories
// @route   GET /api/advisories
// @access  Public
const getAdvisories = async (req, res) => {
  try {
    const { state, district, crop, language } = req.query;

    // Check if regional advisory matches
    let regional = [];
    if (state || district || crop) {
      const regQuery = {};
      if (state) regQuery.state = new RegExp(state, 'i');
      if (district) regQuery.district = new RegExp(district, 'i');
      if (crop) regQuery.crop = new RegExp(crop, 'i');
      if (language) regQuery.language = language;

      regional = await RegionalAdvisory.find(regQuery).limit(5);
    }

    // Recent system advisories
    const query = {};
    if (req.user) query.userId = req.user._id;

    const recent = await Advisory.find(query).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      count: recent.length,
      advisories: recent,
      regional
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateAdvisoryHandler,
  getAdvisories
};
