const Disease = require('../models/Disease');

// @desc    Get all diseases with filtering & search
// @route   GET /api/diseases
// @access  Public
const getDiseases = async (req, res) => {
  try {
    const { crop, search, severity, isHealthy } = req.query;
    const query = {};

    if (crop && crop !== 'All') {
      query.crop = new RegExp(`^${crop}$`, 'i');
    }

    if (severity && severity !== 'All') {
      query.severity = severity;
    }

    if (isHealthy !== undefined) {
      query.isHealthy = isHealthy === 'true';
    }

    if (search) {
      query.$or = [
        { diseaseName: { $regex: search, $options: 'i' } },
        { crop: { $regex: search, $options: 'i' } },
        { symptoms: { $regex: search, $options: 'i' } }
      ];
    }

    const diseases = await Disease.find(query).sort({ crop: 1, diseaseName: 1 });

    res.json({
      success: true,
      count: diseases.length,
      diseases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get distinct list of supported crops
// @route   GET /api/diseases/crops
// @access  Public
const getCrops = async (req, res) => {
  try {
    const crops = await Disease.distinct('crop');
    res.json({
      success: true,
      crops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single disease by ID or classId
// @route   GET /api/diseases/:id
// @access  Public
const getDiseaseById = async (req, res) => {
  try {
    const { id } = req.params;
    let disease;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      disease = await Disease.findById(id);
    } else {
      disease = await Disease.findOne({ classId: id });
    }

    if (!disease) {
      return res.status(404).json({
        success: false,
        message: 'Disease information not found.'
      });
    }

    res.json({
      success: true,
      disease
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new disease entry
// @route   POST /api/diseases
// @access  Private/Admin
const createDisease = async (req, res) => {
  try {
    const disease = await Disease.create(req.body);
    res.status(201).json({
      success: true,
      disease
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update disease entry
// @route   PUT /api/diseases/:id
// @access  Private/Admin
const updateDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!disease) {
      return res.status(404).json({ success: false, message: 'Disease not found' });
    }

    res.json({
      success: true,
      disease
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete disease entry
// @route   DELETE /api/diseases/:id
// @access  Private/Admin
const deleteDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndDelete(req.params.id);

    if (!disease) {
      return res.status(404).json({ success: false, message: 'Disease not found' });
    }

    res.json({
      success: true,
      message: 'Disease record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDiseases,
  getCrops,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease
};
