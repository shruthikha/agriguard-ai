const path = require('path');
const fs = require('fs');
const Scan = require('../models/Scan');
const Disease = require('../models/Disease');
const Advisory = require('../models/Advisory');
const { predictImage } = require('../services/mlService');
const { getWeatherData } = require('../services/weatherService');
const { generateAdvisory } = require('../services/advisoryEngine');

// @desc    Upload crop leaf image and run complete AI prediction + advisory pipeline
// @route   POST /api/predict
// @access  Public / Optional Auth
const processDiseasePrediction = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No leaf image provided. Please upload a clear photo of the crop leaf.'
      });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/scans/${req.file.filename}`;
    const userCropHint = req.body.crop || '';
    const language = req.body.language || req.user?.preferredLanguage || 'en';
    const lat = req.body.lat ? parseFloat(req.body.lat) : (req.user?.location?.lat || 12.823);
    const lon = req.body.lon ? parseFloat(req.body.lon) : (req.user?.location?.lon || 80.044);
    const locationName = req.body.location || (req.user ? `${req.user.location?.district}, ${req.user.location?.state}` : 'Chengalpattu, Tamil Nadu');

    // 1. Call Python ML Service with optional user crop hint
    const mlResult = await predictImage(imagePath, userCropHint);

    const detectedCrop = mlResult.crop || 'Tomato';
    const detectedDisease = mlResult.disease || 'Unknown';
    const confidence = mlResult.confidence || 0;
    const isHealthy = mlResult.isHealthy || false;
    const classId = mlResult.classId || '';
    const topPredictions = mlResult.topPredictions || [];
    const alternativePredictions = mlResult.alternativePredictions || topPredictions.slice(1);
    const quality = mlResult.quality || {};
    const warnings = mlResult.warnings || [];
    const cropHintAnalysis = mlResult.cropHintAnalysis || null;

    // Confidence tier
    let confidenceLevel = 'High';
    if (confidence < 50 || quality?.isOOD) {
      confidenceLevel = 'Low';
    } else if (confidence < 75) {
      confidenceLevel = 'Medium';
    }

    // 2. Fetch Disease Information from MongoDB (with graceful fallback)
    let diseaseDoc = null;
    try {
      diseaseDoc = await Disease.findOne({ classId }).maxTimeMS(2500);
      if (!diseaseDoc) {
        diseaseDoc = await Disease.findOne({
          crop: new RegExp(`^${detectedCrop}$`, 'i'),
          diseaseName: new RegExp(`^${detectedDisease}$`, 'i')
        }).maxTimeMS(2500);
      }
    } catch (dbErr) {
      console.warn('MongoDB query warning (proceeding with fallback data):', dbErr.message);
    }

    // 3. Fetch Weather Context
    const weatherData = await getWeatherData({ lat, lon, city: locationName });

    // 4. Generate Smart Farming Advisory
    const advisory = generateAdvisory({
      crop: detectedCrop,
      disease: detectedDisease,
      confidence,
      isHealthy,
      weather: weatherData,
      language,
      diseaseModel: diseaseDoc,
      quality,
      warnings,
      userCropHint
    });

    // 5. Persist Scan in MongoDB
    const scanData = {
      userId: req.user ? req.user._id : null,
      imageUrl,
      crop: detectedCrop,
      disease: detectedDisease,
      confidence,
      confidenceLevel,
      isHealthy,
      classId,
      userCropHint,
      topPredictions,
      alternativePredictions,
      quality,
      warnings,
      cropHintAnalysis,
      diseaseDetails: diseaseDoc ? {
        symptoms: diseaseDoc.symptoms,
        causes: diseaseDoc.causes,
        severity: diseaseDoc.severity,
        treatment: diseaseDoc.treatment,
        organicTreatment: diseaseDoc.organicTreatment,
        chemicalTreatment: diseaseDoc.chemicalTreatment,
        chemicalWarning: diseaseDoc.chemicalWarning || '',
        preventiveMeasures: diseaseDoc.preventiveMeasures
      } : {
        symptoms: [],
        causes: [],
        severity: 'Medium',
        treatment: [],
        organicTreatment: [],
        chemicalTreatment: [],
        chemicalWarning: '',
        preventiveMeasures: []
      },
      advisory: {
        headline: advisory.headline,
        recommendations: advisory.recommendations,
        actionSteps: advisory.actionSteps,
        weatherRiskNotice: advisory.weatherRiskNotice,
        priority: advisory.priority,
        listenText: advisory.listenText
      },
      weatherAtScan: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        condition: weatherData.weatherCondition,
        windSpeed: weatherData.windSpeed,
        rainfall: weatherData.rainfall,
        locationName: weatherData.location
      },
      status: isHealthy ? 'Healthy' : 'Action Needed',
      notes: req.body.notes || ''
    };

    let savedScan = null;
    try {
      savedScan = await Scan.create(scanData);

      // Also persist stand-alone Advisory record
      if (req.user) {
        await Advisory.create({
          userId: req.user._id,
          crop: detectedCrop,
          disease: detectedDisease,
          weatherData: {
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            rainfall: weatherData.rainfall,
            windSpeed: weatherData.windSpeed,
            condition: weatherData.weatherCondition,
            location: weatherData.location
          },
          recommendation: advisory.headline,
          actionSteps: advisory.actionSteps,
          priority: advisory.priority,
          language
        });
      }
    } catch (saveErr) {
      console.warn('Scan persistence warning (proceeding without db save):', saveErr.message);
      savedScan = { _id: 'temp-' + Date.now(), ...scanData };
    }

    res.status(200).json({
      success: true,
      scanId: savedScan._id,
      _id: savedScan._id,
      crop: detectedCrop,
      disease: detectedDisease,
      confidence,
      confidenceLevel,
      isHealthy,
      classId,
      userCropHint,
      imageUrl,
      topPredictions,
      alternativePredictions,
      quality,
      warnings,
      cropHintAnalysis,
      diseaseDetails: savedScan.diseaseDetails,
      advisory,
      weather: weatherData,
      regionalNames: diseaseDoc?.regionalNames || {},
      disclaimer: 'Prediction confidence is an AI estimate. For uncertain cases, consult a local agricultural expert.'
    });
  } catch (error) {
    console.error('Prediction pipeline failure:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error executing crop disease analysis.'
    });
  }
};


// @desc    Get user scan history with filters & pagination
// @route   GET /api/scans
// @access  Public / Protected (returns user's scans or recent guest scans)
const getScans = async (req, res) => {
  try {
    const { crop, disease, status, sort = 'desc', limit = 50, page = 1 } = req.query;
    const query = {};

    if (req.user) {
      if (req.user.role !== 'admin') {
        query.userId = req.user._id;
      }
    }

    if (crop && crop !== 'All') {
      query.crop = new RegExp(`^${crop}$`, 'i');
    }

    if (disease && disease !== 'All') {
      query.disease = new RegExp(`^${disease}$`, 'i');
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [scans, total] = await Promise.all([
      Scan.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('userId', 'name email location'),
      Scan.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: scans.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      scans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single scan by ID
// @route   GET /api/scans/:id
// @access  Public
const getScanById = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id).populate('userId', 'name email');
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    let regionalNames = {};
    if (scan.classId) {
      const diseaseDoc = await Disease.findOne({ classId: scan.classId });
      if (diseaseDoc?.regionalNames) regionalNames = diseaseDoc.regionalNames;
    }

    const scanObj = scan.toObject();
    res.json({
      success: true,
      scan: {
        ...scanObj,
        scanId: scan._id,
        weather: scan.weatherAtScan,
        regionalNames
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete scan
// @route   DELETE /api/scans/:id
// @access  Private
const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    // Ensure user owns scan or is admin
    if (req.user && req.user.role !== 'admin' && scan.userId && scan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this scan' });
    }

    // Try deleting image file from disk if local
    if (scan.imageUrl && scan.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', scan.imageUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    await Scan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get farmer summary stats for dashboard
// @route   GET /api/scans/stats/summary
// @access  Public / Optional Auth
const getScanStats = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const totalScans = await Scan.countDocuments(query);
    const healthyScans = await Scan.countDocuments({ ...query, isHealthy: true });
    const diseasedScans = totalScans - healthyScans;

    // Disease breakdown
    const diseaseBreakdown = await Scan.aggregate([
      { $match: query },
      { $group: { _id: '$disease', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Crop breakdown
    const cropBreakdown = await Scan.aggregate([
      { $match: query },
      { $group: { _id: '$crop', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent 5 scans
    const recentScans = await Scan.find(query).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalScans,
        healthyScans,
        diseasedScans,
        healthRatio: totalScans > 0 ? Math.round((healthyScans / totalScans) * 100) : 0,
        diseaseBreakdown: diseaseBreakdown.map(d => ({ name: d._id, count: d.count, confidence: Math.round(d.avgConfidence) })),
        cropBreakdown: cropBreakdown.map(c => ({ name: c._id, count: c.count })),
        recentScans
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  processDiseasePrediction,
  getScans,
  getScanById,
  deleteScan,
  getScanStats
};
