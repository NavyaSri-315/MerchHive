const RFQ = require('../models/RFQ');
const Product = require('../models/Product');
const Message = require('../models/Message');

// @desc    Create a Request For Quotation (RFQ)
// @route   POST /api/rfqs
// @access  Private (Buyer)
const createRFQ = async (req, res) => {
  try {
    const { productId, quantity, targetPricePerUnit, notes, deliveryLocation, targetDeliveryDate } = req.body;

    const product = await Product.findById(productId).populate('company');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (Number(quantity) < product.moq) {
      return res.status(400).json({
        success: false,
        message: `Quantity (${quantity}) must meet or exceed product MOQ (${product.moq} ${product.unit})`,
      });
    }

    const rfq = await RFQ.create({
      buyer: req.user._id,
      buyerCompany: req.user.company ? req.user.company._id : null,
      supplier: product.supplier,
      supplierCompany: product.company ? product.company._id : null,
      product: product._id,
      quantity: Number(quantity),
      targetPricePerUnit: Number(targetPricePerUnit),
      currentOfferedPrice: Number(targetPricePerUnit),
      lastOfferedBy: req.user._id,
      status: 'pending',
      notes: notes || '',
      deliveryLocation: deliveryLocation || '',
      targetDeliveryDate: targetDeliveryDate || null,
      counterOffers: [
        {
          offeredBy: req.user._id,
          role: 'buyer',
          pricePerUnit: Number(targetPricePerUnit),
          quantity: Number(quantity),
          notes: notes || 'Initial buyer quotation request',
        },
      ],
    });

    // Create an initial negotiation chat message
    await Message.create({
      rfq: rfq._id,
      sender: req.user._id,
      receiver: product.supplier,
      message: `Hello! I have requested an RFQ for ${quantity} ${product.unit} of ${product.name} at a target price of ₹${targetPricePerUnit}/unit. Delivery location: ${deliveryLocation || 'Standard Warehouse'}.`,
      offerDetails: {
        isCounterOffer: true,
        pricePerUnit: Number(targetPricePerUnit),
        quantity: Number(quantity),
        status: 'pending',
      },
    });

    const populatedRFQ = await RFQ.findById(rfq._id)
      .populate('product', 'name sku images unit moq tieredPricing')
      .populate('buyerCompany', 'name verificationStatus')
      .populate('supplierCompany', 'name verificationStatus')
      .populate('supplier', 'name email');

    res.status(201).json({
      success: true,
      rfq: populatedRFQ,
      message: 'RFQ submitted successfully! Supplier has been notified.',
    });
  } catch (error) {
    console.error('[Create RFQ Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's RFQs (buyer or supplier)
// @route   GET /api/rfqs
// @access  Private
const getRFQs = async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = {};

    if (req.user.role === 'buyer') {
      query.buyer = req.user._id;
    } else if (req.user.role === 'supplier') {
      query.supplier = req.user._id;
    } else if (req.user.role === 'superadmin') {
      // Super admin can see all or filter
    }

    if (status) {
      query.status = status;
    }

    const rfqs = await RFQ.find(query)
      .populate('product', 'name sku images unit moq basePrice')
      .populate('buyer', 'name email avatar phone')
      .populate('buyerCompany', 'name verificationStatus taxId')
      .populate('supplier', 'name email avatar phone')
      .populate('supplierCompany', 'name verificationStatus taxId')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: rfqs.length,
      rfqs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single RFQ with counter-offer timeline
// @route   GET /api/rfqs/:id
// @access  Private
const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('product')
      .populate('buyer', 'name email avatar phone')
      .populate('buyerCompany', 'name verificationStatus taxId address')
      .populate('supplier', 'name email avatar phone')
      .populate('supplierCompany', 'name verificationStatus taxId address')
      .populate('counterOffers.offeredBy', 'name role avatar');

    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    // Ensure only participants or admin can access
    const isParticipant =
      rfq.buyer._id.toString() === req.user._id.toString() ||
      rfq.supplier._id.toString() === req.user._id.toString() ||
      req.user.role === 'superadmin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this RFQ' });
    }

    res.json({
      success: true,
      rfq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit counter-offer on RFQ
// @route   POST /api/rfqs/:id/counter
// @access  Private
const submitCounterOffer = async (req, res) => {
  try {
    const { pricePerUnit, quantity, leadTimeDays, notes } = req.body;
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    if (rfq.status === 'accepted' || rfq.status === 'ordered') {
      return res.status(400).json({ success: false, message: 'This quotation has already been locked & accepted' });
    }

    const isBuyer = rfq.buyer.toString() === req.user._id.toString();
    const isSupplier = rfq.supplier.toString() === req.user._id.toString();

    if (!isBuyer && !isSupplier) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const offerPrice = Number(pricePerUnit);
    const offerQty = Number(quantity) || rfq.quantity;

    rfq.currentOfferedPrice = offerPrice;
    rfq.quantity = offerQty;
    rfq.status = 'countered';
    rfq.lastOfferedBy = req.user._id;

    rfq.counterOffers.push({
      offeredBy: req.user._id,
      role: isBuyer ? 'buyer' : 'supplier',
      pricePerUnit: offerPrice,
      quantity: offerQty,
      leadTimeDays: Number(leadTimeDays) || 7,
      notes: notes || '',
    });

    await rfq.save();

    // Auto-create chat message for the counter offer
    await Message.create({
      rfq: rfq._id,
      sender: req.user._id,
      receiver: isBuyer ? rfq.supplier : rfq.buyer,
      message: `Counter-Offer: ₹${offerPrice}/unit for ${offerQty} units. Note: ${notes || 'Updated quotation terms.'}`,
      offerDetails: {
        isCounterOffer: true,
        pricePerUnit: offerPrice,
        quantity: offerQty,
        leadTimeDays: Number(leadTimeDays) || 7,
        status: 'pending',
      },
    });

    const updated = await RFQ.findById(rfq._id)
      .populate('product')
      .populate('counterOffers.offeredBy', 'name role avatar');

    res.json({
      success: true,
      rfq: updated,
      message: 'Counter offer submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept quotation offer
// @route   POST /api/rfqs/:id/accept
// @access  Private
const acceptOffer = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id).populate('product');
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    if (rfq.status === 'accepted' || rfq.status === 'ordered') {
      return res.status(400).json({ success: false, message: 'Quotation is already finalized' });
    }

    rfq.status = 'accepted';
    rfq.acceptedAt = new Date();
    await rfq.save();

    // Notify in chat
    const isBuyer = rfq.buyer.toString() === req.user._id.toString();
    await Message.create({
      rfq: rfq._id,
      sender: req.user._id,
      receiver: isBuyer ? rfq.supplier : rfq.buyer,
      message: `Quotation ACCEPTED at ₹${rfq.currentOfferedPrice}/unit for ${rfq.quantity} ${rfq.product?.unit || 'units'}! You can now place the bulk order.`,
      offerDetails: {
        isCounterOffer: false,
        pricePerUnit: rfq.currentOfferedPrice,
        quantity: rfq.quantity,
        status: 'accepted',
      },
    });

    res.json({
      success: true,
      rfq,
      message: 'Quotation accepted! You can now proceed to checkout with the negotiated rate.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject quotation offer
// @route   POST /api/rfqs/:id/reject
// @access  Private
const rejectOffer = async (req, res) => {
  try {
    const { reason } = req.body;
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    rfq.status = 'rejected';
    await rfq.save();

    const isBuyer = rfq.buyer.toString() === req.user._id.toString();
    await Message.create({
      rfq: rfq._id,
      sender: req.user._id,
      receiver: isBuyer ? rfq.supplier : rfq.buyer,
      message: `Quotation was REJECTED: ${reason || 'Negotiation ended by participant.'}`,
      offerDetails: {
        isCounterOffer: false,
        status: 'rejected',
      },
    });

    res.json({
      success: true,
      rfq,
      message: 'Quotation marked as rejected',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRFQ,
  getRFQs,
  getRFQById,
  submitCounterOffer,
  acceptOffer,
  rejectOffer,
};
