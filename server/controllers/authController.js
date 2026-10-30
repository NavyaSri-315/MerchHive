const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bulkconnect_super_secret_jwt_key_2026_secure', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user & create linked business entity
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, companyName, businessType, taxId, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer',
      phone: phone || '',
    });

    // If role is supplier or buyer, create Company profile
    let company = null;
    if (role === 'supplier' || role === 'buyer') {
      company = await Company.create({
        name: companyName || `${name}'s Enterprises`,
        user: user._id,
        businessType: businessType || (role === 'supplier' ? 'manufacturer' : 'wholesaler'),
        taxId: taxId || 'GSTIN-PENDING',
        verificationStatus: 'pending',
        address: address || { street: '', city: '', state: '', country: 'India', zip: '' },
      });

      user.company = company._id;
      await user.save();
    }

    const populatedUser = await User.findById(user._id).select('-password').populate('company');
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: populatedUser,
      message: 'Account created successfully! Please complete company document verification.',
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('company');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('company');
    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
