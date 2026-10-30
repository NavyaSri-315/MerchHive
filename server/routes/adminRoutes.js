const express = require('express');
const router = express.Router();
const {
  getPlatformAnalytics,
  getVerificationQueue,
  reviewCompanyVerification,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Categories public read
router.get('/categories', getCategories);

// SuperAdmin operations
router.use(protect);
router.use(authorize('superadmin'));

router.get('/analytics', getPlatformAnalytics);
router.get('/verification-queue', getVerificationQueue);
router.put('/verify-company/:id', reviewCompanyVerification);

router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
