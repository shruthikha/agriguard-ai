const express = require('express');
const router = express.Router();
const {
  processDiseasePrediction,
  getScans,
  getScanById,
  deleteScan,
  getScanStats
} = require('../controllers/scanController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', optionalAuth, upload.single('image'), processDiseasePrediction);
router.get('/', optionalAuth, getScans);
router.get('/stats/summary', optionalAuth, getScanStats);
router.get('/:id', getScanById);
router.delete('/:id', optionalAuth, deleteScan);

module.exports = router;
