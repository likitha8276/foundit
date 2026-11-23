const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const {
  getStats,
  getItemsForModeration,
  moderateItem,
  getUsers,
  toggleUserStatus,
  deleteUser,
  getAuditLogs,
  getModelPerformance
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/items', getItemsForModeration);
router.post('/items/:id/moderate', moderateItem);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/audit-logs', getAuditLogs);
router.get('/performance', getModelPerformance);

module.exports = router;
