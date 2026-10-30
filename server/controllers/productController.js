const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all active products with filters, search, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minMoq, maxMoq, sort, page = 1, limit = 12 } = req.query;

    const query = { status: 'active' };

    if (category) {
      // Find category by slug or id
      const catObj = await Category.findOne({ $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }] });
      if (catObj) {
        query.category = catObj._id;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minMoq) {
      query.moq = { ...query.moq, $gte: Number(minMoq) };
    }
    if (maxMoq) {
      query.moq = { ...query.moq, $lte: Number(maxMoq) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { basePrice: 1 };
    if (sort === 'price_desc') sortOption = { basePrice: -1 };
    if (sort === 'moq_asc') sortOption = { moq: 1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug icon')
        .populate('company', 'name verificationStatus rating logo address')
        .populate('supplier', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('[Get Products Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug icon')
      .populate('company', 'name verificationStatus rating logo address taxId businessType')
      .populate('supplier', 'name email phone avatar');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate tiered price for a product & quantity
// @route   POST /api/products/:id/calculate-price
// @access  Public
const calculateProductPrice = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qty = Number(quantity) || product.moq;
    const unitPrice = product.getPriceForQuantity(qty);
    const subtotal = unitPrice * qty;
    const tax = (subtotal * (product.taxPercent || 18)) / 100;
    const total = subtotal + tax;

    res.json({
      success: true,
      quantity: qty,
      unitPrice,
      subtotal,
      tax,
      total,
      meetsMoq: qty >= product.moq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product (Supplier only)
// @route   POST /api/products
// @access  Private (Supplier)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      brand,
      images,
      specifications,
      moq,
      stock,
      unit,
      tieredPricing,
      leadTimeDays,
      hsnCode,
      taxPercent,
      status,
    } = req.body;

    if (!name || !sku || !category || !moq || !tieredPricing || tieredPricing.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including SKU, category, MOQ, and at least one pricing tier',
      });
    }

    // Check duplicate SKU for this supplier
    const existingSku = await Product.findOne({ sku: sku.toUpperCase(), supplier: req.user._id });
    if (existingSku) {
      return res.status(400).json({ success: false, message: 'You already have a product with this SKU' });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      description,
      category,
      supplier: req.user._id,
      company: req.user.company._id,
      brand: brand || 'Generic',
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80'],
      specifications: specifications || [],
      moq: Number(moq),
      stock: Number(stock) || 0,
      unit: unit || 'units',
      tieredPricing,
      leadTimeDays: Number(leadTimeDays) || 5,
      hsnCode: hsnCode || '84713010',
      taxPercent: Number(taxPercent) || 18,
      status: status || 'active',
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('company', 'name verificationStatus');

    res.status(201).json({
      success: true,
      product: populatedProduct,
      message: 'Product listed successfully in wholesale catalog',
    });
  } catch (error) {
    console.error('[Create Product Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product (Supplier owner or Superadmin)
// @route   PUT /api/products/:id
// @access  Private (Supplier/Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership
    if (product.supplier.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this product' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name slug')
      .populate('company', 'name verificationStatus');

    res.json({
      success: true,
      product: updated,
      message: 'Product updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Supplier/Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.supplier.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product removed from catalog',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current supplier's own products
// @route   GET /api/products/supplier/my
// @access  Private (Supplier)
const getMySupplierProducts = async (req, res) => {
  try {
    const products = await Product.find({ supplier: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  calculateProductPrice,
  createProduct,
  updateProduct,
  deleteProduct,
  getMySupplierProducts,
};
