const Message = require('../models/Message');
const RFQ = require('../models/RFQ');

// @desc    Get chat message history for an RFQ
// @route   GET /api/chat/rfq/:rfqId
// @access  Private
const getMessagesByRFQ = async (req, res) => {
  try {
    const { rfqId } = req.params;

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    // Auth check
    const isParticipant =
      rfq.buyer.toString() === req.user._id.toString() ||
      rfq.supplier.toString() === req.user._id.toString() ||
      req.user.role === 'superadmin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages' });
    }

    const messages = await Message.find({ rfq: rfqId })
      .populate('sender', 'name email avatar role')
      .populate('receiver', 'name email avatar role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { rfq: rfqId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send negotiation message via REST API
// @route   POST /api/chat/rfq/:rfqId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const { message, offerDetails } = req.body;

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    const isBuyer = rfq.buyer.toString() === req.user._id.toString();
    const receiverId = isBuyer ? rfq.supplier : rfq.buyer;

    const newMsg = await Message.create({
      rfq: rfqId,
      sender: req.user._id,
      receiver: receiverId,
      message,
      offerDetails: offerDetails || { isCounterOffer: false },
    });

    const populatedMsg = await Message.findById(newMsg._id)
      .populate('sender', 'name email avatar role')
      .populate('receiver', 'name email avatar role');

    res.status(201).json({
      success: true,
      message: populatedMsg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMessagesByRFQ,
  sendMessage,
};
