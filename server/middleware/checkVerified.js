// Verification Status Enforcement Middleware
const checkVerified = async (req, res, next) => {
  // SuperAdmin is exempt
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }

  if (!req.user || !req.user.company) {
    return res.status(403).json({
      success: false,
      verificationStatus: 'unregistered',
      message: 'Business profile not set up. Please register your company details first.',
    });
  }

  const company = req.user.company;
  const status = company.verificationStatus;

  if (status !== 'approved') {
    return res.status(403).json({
      success: false,
      verificationStatus: status,
      message:
        status === 'pending'
          ? 'Your company verification (GST/Tax ID) is currently pending admin approval. Trading actions are restricted until verified.'
          : `Your company verification was rejected: ${company.rejectionReason || 'Please review your uploaded documents.'}`,
    });
  }

  next();
};

module.exports = { checkVerified };
