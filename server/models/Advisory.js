const mongoose = require('mongoose');

const advisorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  crop: {
    type: String,
    required: true
  },
  disease: {
    type: String,
    default: 'None'
  },
  weatherData: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    windSpeed: Number,
    condition: String,
    location: String
  },
  recommendation: {
    type: String,
    required: true
  },
  actionSteps: [{
    type: String
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['Disease Prevention', 'Irrigation', 'Weather Warning', 'Nutrient Care', 'Harvest Advisory'],
    default: 'Disease Prevention'
  },
  language: {
    type: String,
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Advisory', advisorySchema);
