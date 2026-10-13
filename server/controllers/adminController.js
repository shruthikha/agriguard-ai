const User = require('../models/User');
const Scan = require('../models/Scan');
const Disease = require('../models/Disease');
const Advisory = require('../models/Advisory');

// @desc    Get aggregate analytics for Admin dashboard
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getAdminStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalScans = await Scan.countDocuments();
    const healthyScans = await Scan.countDocuments({ isHealthy: true });
    const diseasedScans = totalScans - healthyScans;

    // Average confidence across all scans
    const avgConfidenceAgg = await Scan.aggregate([
      { $group: { _id: null, avgConf: { $avg: '$confidence' } } }
    ]);
    const averageConfidence = avgConfidenceAgg.length > 0 ? Math.round(avgConfidenceAgg[0].avgConf * 10) / 10 : 0;

    // Disease distribution
    const diseaseDistribution = await Scan.aggregate([
      { $group: { _id: '$disease', count: { $sum: 1 }, crop: { $first: '$crop' } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Most detected crops
    const cropDistribution = await Scan.aggregate([
      { $group: { _id: '$crop', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily scans trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyScans = await Scan.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          healthy: { $sum: { $cond: ['$isHealthy', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalDiseases = await Disease.countDocuments();

    res.json({
      success: true,
      totalUsers,
      totalFarmers,
      totalScans,
      healthyScans,
      diseasedScans,
      totalDiseases,
      averageConfidence,
      data: {
        totalUsers,
        totalFarmers,
        totalScans,
        healthyScans,
        diseasedScans,
        totalDiseases,
        averageConfidence,
        diseaseDistribution: diseaseDistribution.map(d => ({ name: d._id, crop: d.crop, count: d.count })),
        cropDistribution: cropDistribution.map(c => ({ name: c._id, count: c.count })),
        dailyScans: dailyScans.map(s => ({ date: s._id, count: s.count, healthy: s.healthy, diseased: s.count - s.healthy }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cascade delete scans
    await Scan.deleteMany({ userId: user._id });

    res.json({
      success: true,
      message: 'User and associated scan data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all scans for audit
// @route   GET /api/admin/scans
// @access  Private/Admin
const getAllScans = async (req, res) => {
  try {
    const { crop, disease, page = 1, limit = 50 } = req.query;
    const query = {};

    if (crop && crop !== 'All') query.crop = crop;
    if (disease && disease !== 'All') query.disease = disease;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [scans, total] = await Promise.all([
      Scan.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).populate('userId', 'name email location'),
      Scan.countDocuments(query)
    ]);

    res.json({
      success: true,
      total,
      count: scans.length,
      scans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed disease database (admin trigger)
// @route   POST /api/admin/seed
// @access  Private/Admin
const seedDatabase = async (req, res) => {
  try {
    const path = require('path');
    const seedFilePath = path.join(__dirname, '..', 'seeds', 'seedDiseases.js');
    
    // Run seed logic inline to avoid process.exit() issues
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');
    const seedModule = require(seedFilePath);
    
    // If seedModule exports a function, call it
    if (typeof seedModule === 'function') {
      await seedModule();
      return res.json({ success: true, message: 'Database seeded successfully!' });
    }
    
    // Otherwise run the embedded seed logic directly
    const diseaseCount = await Disease.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      message: `Database already has ${diseaseCount} diseases and ${userCount} users. Run seed script manually if needed: node server/seeds/seedDiseases.js`,
      diseaseCount,
      userCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Seed failed: ${error.message}` });
  }
};

module.exports = {
  getAdminStatistics,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllScans,
  seedDatabase
};
