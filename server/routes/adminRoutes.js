const express = require('express');
const router = express.Router();
const {
  getAdminStatistics,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllScans,
  seedDatabase
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

// All admin routes protected
router.use(protect, authorizeAdmin);

router.get('/statistics', getAdminStatistics);
router.get('/stats', getAdminStatistics); // alias
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.patch('/users/:id/role', updateUserRole); // also support PATCH
router.delete('/users/:id', deleteUser);
router.get('/scans', getAllScans);
router.post('/seed', seedDatabase);

module.exports = router;
