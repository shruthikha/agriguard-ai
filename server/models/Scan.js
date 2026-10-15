const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  imageUrl: {
    type: String,
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  disease: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  confidenceLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  },
  isHealthy: {
    type: Boolean,
    default: false
  },
  classId: {
    type: String,
    default: ''
  },
  userCropHint: {
    type: String,
    default: ''
  },
  topPredictions: [{
    crop: String,
    disease: String,
    confidence: Number,
    isHealthy: Boolean,
    classId: String
  }],
  alternativePredictions: [{
    crop: String,
    disease: String,
    confidence: Number,
    isHealthy: Boolean,
    classId: String
  }],
  quality: {
    isBlurry: Boolean,
    blurScore: Number,
    isLeafDetected: Boolean,
    leafRatio: Number,
    isOOD: Boolean,
    entropy: Number
  },
  warnings: [String],
  cropHintAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  diseaseDetails: {

    symptoms: [String],
    causes: [String],
    severity: String,
    treatment: [String],
    organicTreatment: [String],
    chemicalTreatment: [String],
    chemicalWarning: String,
    preventiveMeasures: [String]
  },
  advisory: {
    headline: String,
    recommendations: [String],
    actionSteps: [String],
    weatherRiskNotice: String,
    priority: String,
    listenText: String
  },
  weatherAtScan: {
    temperature: Number,
    humidity: Number,
    condition: String,
    windSpeed: Number,
    rainfall: Number,
    locationName: String
  },
  status: {
    type: String,
    enum: ['Healthy', 'Action Needed', 'Treated', 'Under Monitoring'],
    default: 'Action Needed'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scan', scanSchema);
