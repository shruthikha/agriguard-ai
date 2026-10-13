const mongoose = require('mongoose');

const regionalAdvisorySchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    index: true
  },
  district: {
    type: String,
    required: true,
    index: true
  },
  crop: {
    type: String,
    required: true,
    index: true
  },
  season: {
    type: String,
    enum: ['Kharif', 'Rabi', 'Zaid', 'All Season'],
    default: 'All Season'
  },
  language: {
    type: String,
    default: 'en'
  },
  advisory: {
    type: String,
    required: true
  },
  preventiveMeasures: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RegionalAdvisory', regionalAdvisorySchema);
