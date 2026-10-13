const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  diseaseName: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  scientificName: {
    type: String,
    default: ''
  },
  classId: {
    type: String,
    unique: true,
    index: true
  },
  isHealthy: {
    type: Boolean,
    default: false
  },
  symptoms: [{
    type: String
  }],
  causes: [{
    type: String
  }],
  severity: {
    type: String,
    enum: ['None', 'Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  treatment: [{
    type: String
  }],
  organicTreatment: [{
    type: String
  }],
  chemicalTreatment: [{
    type: String
  }],
  chemicalWarning: {
    type: String,
    default: 'Always read and follow pesticide/fungicide label directions, safety precautions, and local agricultural authority regulations.'
  },
  preventiveMeasures: [{
    type: String
  }],
  affectedParts: [{
    type: String
  }],
  environmentalConditions: {
    idealTemp: { type: String, default: '20°C - 30°C' },
    humidityRisk: { type: String, default: 'High humidity (>80%) accelerates disease spread' },
    rainfallImpact: { type: String, default: 'Prolonged leaf wetness promotes spore germination' }
  },
  recommendedActions: [{
    type: String
  }],
  simpleExplanation: {
    type: String,
    default: ''
  },
  regionalNames: {
    ta: { type: String, default: '' },
    hi: { type: String, default: '' },
    te: { type: String, default: '' },
    kn: { type: String, default: '' },
    ml: { type: String, default: '' },
    mr: { type: String, default: '' },
    bn: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Disease', diseaseSchema);
