const Company = require('../models/Company');
const Product = require('../models/Product');

// @desc    Get current user's company profile
// @route   GET /api/companies/my
// @access  Private
const getMyCompany = async (req, res) => {
  try {
    let company = await Company.findOne({ user: req.user._id });

    // Auto-create stub if missing
    if (!company) {
      company = await Company.create({
        name: `${req.user.name}'s Enterprise`,
        user: req.user._id,
        businessType: req.user.role === 'supplier' ? 'manufacturer' : 'wholesaler',
        taxId: 'PENDING-UPDATE',
        verificationStatus: 'pending',
      });
      req.user.company = company._id;
      await req.user.save();
    }

    res.json({
      success: true,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update company details (Tax ID, address, contact)
// @route   PUT /api/companies/my
// @access  Private
const updateMyCompany = async (req, res) => {
  try {
    const { name, businessType, taxId, address, contactPhone, contactEmail, website, establishedYear } = req.body;

    let company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (name) company.name = name;
    if (businessType) company.businessType = businessType;
    if (taxId) {
      company.taxId = taxId;
      // If tax ID modified and was rejected, reset to pending for review
      if (company.verificationStatus === 'rejected') {
        company.verificationStatus = 'pending';
        company.rejectionReason = '';
      }
    }
    if (address) company.address = { ...company.address.toObject(), ...address };
    if (contactPhone) company.contactPhone = contactPhone;
    if (contactEmail) company.contactEmail = contactEmail;
    if (website) company.website = website;
    if (establishedYear) company.establishedYear = establishedYear;

    await company.save();

    res.json({
      success: true,
      company,
      message: 'Company profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload company document (GST/PAN/License)
// @route   POST /api/companies/documents
// @access  Private
const uploadCompanyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, documentType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    company.documents.push({
      title: title || req.file.originalname,
      url: fileUrl,
      documentType: documentType || 'gst_cert',
      uploadedAt: new Date(),
    });

    // If documents are uploaded, trigger verification status to pending
    company.verificationStatus = 'pending';
    company.rejectionReason = '';
    await company.save();

    res.json({
      success: true,
      company,
      message: 'Document uploaded successfully and submitted for admin verification.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public company details
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('user', 'name email avatar');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const productsCount = await Product.countDocuments({ company: company._id, status: 'active' });

    res.json({
      success: true,
      company,
      stats: {
        productsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyCompany,
  updateMyCompany,
  uploadCompanyDocument,
  getCompanyById,
};
