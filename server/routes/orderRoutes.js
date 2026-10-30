const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateShipmentStatus,
  downloadInvoice,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { checkVerified } = require('../middleware/checkVerified');

router.use(protect);

router.post('/', checkVerified, createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/shipment', updateShipmentStatus);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
