const Order = require('../models/Order');
const Product = require('../models/Product');
const RFQ = require('../models/RFQ');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

// @desc    Create bulk order
// @route   POST /api/orders
// @access  Private (Buyer)
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes, rfqId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    let subtotal = 0;
    let supplierId = null;
    let supplierCompanyId = null;
    const processedItems = [];

    // Process items and verify pricing/stock
    for (const item of items) {
      const product = await Product.findById(item.productId).populate('company');
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name || item.productId} not found` });
      }

      supplierId = product.supplier;
      supplierCompanyId = product.company ? product.company._id : null;

      let unitPrice = item.unitPrice;
      let isRfq = false;

      // If item comes from accepted RFQ, use the locked negotiated price
      if (item.rfqId || rfqId) {
        const rfqDoc = await RFQ.findById(item.rfqId || rfqId);
        if (rfqDoc && rfqDoc.status === 'accepted') {
          unitPrice = rfqDoc.currentOfferedPrice;
          isRfq = true;
          rfqDoc.status = 'ordered';
          await rfqDoc.save();
        }
      } else {
        // Enforce tiered pricing from product
        unitPrice = product.getPriceForQuantity(item.quantity);
      }

      const itemTotal = unitPrice * Number(item.quantity);
      subtotal += itemTotal;

      // Decrement stock
      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await product.save();
      }

      processedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || '',
        unit: product.unit,
        quantity: Number(item.quantity),
        unitPrice,
        totalPrice: itemTotal,
        isRfqNegotiated: isRfq,
        rfqId: isRfq ? (item.rfqId || rfqId) : null,
      });
    }

    const taxAmount = Math.round(subtotal * 0.18); // 18% GST
    const shippingFee = subtotal > 100000 ? 0 : 2500; // Free freight over ₹1 Lakh
    const platformCommission = Math.round(subtotal * 0.035); // 3.5% platform commission
    const totalAmount = subtotal + taxAmount + shippingFee;

    const order = await Order.create({
      buyer: req.user._id,
      buyerCompany: req.user.company ? req.user.company._id : null,
      supplier: supplierId,
      supplierCompany: supplierCompanyId,
      items: processedItems,
      subtotal,
      taxAmount,
      shippingFee,
      platformCommission,
      totalAmount,
      paymentMethod: paymentMethod || 'b2b_credit_terms',
      paymentStatus: paymentMethod === 'b2b_credit_terms' ? 'credit_approved' : 'paid',
      orderStatus: 'confirmed',
      shippingAddress: {
        contactName: shippingAddress.contactName || req.user.name,
        companyName: shippingAddress.companyName || req.user.company?.name || 'Buyer Enterprise',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || 'Maharashtra',
        country: shippingAddress.country || 'India',
        zip: shippingAddress.zip,
        phone: shippingAddress.phone || req.user.phone || '9876543210',
        gstNumber: shippingAddress.gstNumber || req.user.company?.taxId || '',
      },
      notes: notes || '',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('buyerCompany')
      .populate('supplier', 'name email phone')
      .populate('supplierCompany');

    res.status(201).json({
      success: true,
      order: populatedOrder,
      message: 'Bulk order placed successfully! Tax invoice has been generated.',
    });
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders for current user (Buyer or Supplier)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'buyer') {
      query.buyer = req.user._id;
    } else if (req.user.role === 'supplier') {
      query.supplier = req.user._id;
    }

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('buyer', 'name email phone')
      .populate('buyerCompany', 'name taxId')
      .populate('supplier', 'name email phone')
      .populate('supplierCompany', 'name taxId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone avatar')
      .populate('buyerCompany')
      .populate('supplier', 'name email phone avatar')
      .populate('supplierCompany');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isParticipant =
      order.buyer._id.toString() === req.user._id.toString() ||
      order.supplier._id.toString() === req.user._id.toString() ||
      req.user.role === 'superadmin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update courier shipment tracking (Supplier only)
// @route   PUT /api/orders/:id/shipment
// @access  Private (Supplier/Admin)
const updateShipmentStatus = async (req, res) => {
  try {
    const { trackingId, carrier, orderStatus, estimatedDelivery, courierNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.supplier.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this shipment' });
    }

    if (trackingId) order.shipment.trackingId = trackingId;
    if (carrier) order.shipment.carrier = carrier;
    if (courierNotes) order.shipment.courierNotes = courierNotes;
    if (estimatedDelivery) order.shipment.estimatedDelivery = estimatedDelivery;

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'shipped' && !order.shipment.shippedAt) {
        order.shipment.shippedAt = new Date();
      }
    }

    await order.save();

    const updated = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('supplier', 'name email');

    res.json({
      success: true,
      order: updated,
      message: 'Shipment and delivery tracking updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download generated PDF invoice for order
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('buyerCompany')
      .populate('supplier', 'name email phone')
      .populate('supplierCompany');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isParticipant =
      order.buyer._id.toString() === req.user._id.toString() ||
      order.supplier._id.toString() === req.user._id.toString() ||
      req.user.role === 'superadmin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this invoice' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderNumber}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    console.error('[Invoice Error]', error);
    res.status(500).json({ success: false, message: 'Error generating invoice PDF' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateShipmentStatus,
  downloadInvoice,
};
