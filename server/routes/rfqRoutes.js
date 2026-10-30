const express = require('express');
const router = express.Router();
const {
  createRFQ,
  getRFQs,
  getRFQById,
  submitCounterOffer,
  acceptOffer,
  rejectOffer,
} = require('../controllers/rfqController');
const { protect } = require('../middleware/authMiddleware');
const { checkVerified } = require('../middleware/checkVerified');

router.use(protect);

router.post('/', checkVerified, createRFQ);
router.get('/', getRFQs);
router.get('/:id', getRFQById);
router.post('/:id/counter', checkVerified, submitCounterOffer);
router.post('/:id/accept', checkVerified, acceptOffer);
router.post('/:id/reject', checkVerified, rejectOffer);

module.exports = router;
