const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Sends image to Python FastAPI service for disease prediction.
 * @param {string} imagePath Local path to saved image
 * @param {string} [cropHint] Optional user-selected crop hint
 * @returns {Promise<Object>} Prediction result
 */
async function predictImage(imagePath, cropHint = '') {
  if (!fs.existsSync(imagePath)) {
    throw new Error('Image file not found on server.');
  }

  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  if (cropHint && typeof cropHint === 'string' && cropHint.trim()) {
    form.append('crop', cropHint.trim());
  }


  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 45000
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('ML Prediction Service is currently unavailable. Please verify the Python service is running.');
    }
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(`ML Service Error: ${error.message}`);
  }
}

/**
 * Checks health of ML service.
 */
async function checkMLHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 15000 });
    return response.data;
  } catch (error) {
    return { status: 'down', error: error.message };
  }
}

module.exports = {
  predictImage,
  checkMLHealth
};
