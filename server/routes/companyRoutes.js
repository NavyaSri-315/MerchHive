const express = require('express');
const router = express.Router();
const { getMyCompany, updateMyCompany, uploadCompanyDocument, getCompanyById } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my', protect, getMyCompany);
router.put('/my', protect, updateMyCompany);
router.post('/documents', protect, upload.single('document'), uploadCompanyDocument);
router.get('/:id', getCompanyById);

module.exports = router;
