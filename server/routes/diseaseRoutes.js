const express = require('express');
const router = express.Router();
const {
  getDiseases,
  getCrops,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease
} = require('../controllers/diseaseController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

router.get('/', getDiseases);
router.get('/crops', getCrops);
router.get('/:id', getDiseaseById);

// Admin-only endpoints
router.post('/', protect, authorizeAdmin, createDisease);
router.put('/:id', protect, authorizeAdmin, updateDisease);
router.delete('/:id', protect, authorizeAdmin, deleteDisease);

module.exports = router;
