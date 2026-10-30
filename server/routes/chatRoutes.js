const express = require('express');
const router = express.Router();
const { getMessagesByRFQ, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/rfq/:rfqId', getMessagesByRFQ);
router.post('/rfq/:rfqId', sendMessage);

module.exports = router;
