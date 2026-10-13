const express = require('express');
const router = express.Router();
const { generateAdvisoryHandler, getAdvisories } = require('../controllers/advisoryController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate', generateAdvisoryHandler);
router.get('/', optionalAuth, getAdvisories);

module.exports = router;
