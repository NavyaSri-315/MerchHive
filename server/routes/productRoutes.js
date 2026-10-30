const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  calculateProductPrice,
  createProduct,
  updateProduct,
  deleteProduct,
  getMySupplierProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { checkVerified } = require('../middleware/checkVerified');

router.get('/', getProducts);
router.get('/supplier/my', protect, authorize('supplier'), getMySupplierProducts);
router.get('/:id', getProductById);
router.post('/:id/calculate-price', calculateProductPrice);

// Protected routes for verified suppliers or superadmin
router.post('/', protect, authorize('supplier', 'superadmin'), checkVerified, createProduct);
router.put('/:id', protect, authorize('supplier', 'superadmin'), checkVerified, updateProduct);
router.delete('/:id', protect, authorize('supplier', 'superadmin'), deleteProduct);

module.exports = router;
