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
  topPredictions: [{
    crop: String,
    disease: String,
    confidence: Number,
    isHealthy: Boolean
  }],
  diseaseDetails: {
    symptoms: [String],
    causes: [String],
    severity: String,
    treatment: [String],
    organicTreatment: [String],
    chemicalTreatment: [String],
    preventiveMeasures: [String]
  },
  advisory: {
    headline: String,
    recommendations: [String],
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
