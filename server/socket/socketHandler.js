const Message = require('../models/Message');
const RFQ = require('../models/RFQ');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room for a specific RFQ negotiation session
    socket.on('join_rfq', ({ rfqId, userId }) => {
      if (!rfqId) return;
      socket.join(`rfq_${rfqId}`);
      console.log(`[Socket] User ${userId || 'unknown'} joined negotiation room: rfq_${rfqId}`);
      socket.to(`rfq_${rfqId}`).emit('user_joined', { userId, rfqId });
    });

    // Leave RFQ negotiation room
    socket.on('leave_rfq', ({ rfqId }) => {
      if (!rfqId) return;
      socket.leave(`rfq_${rfqId}`);
      console.log(`[Socket] Client left room: rfq_${rfqId}`);
    });

    // Handle negotiation message sending
    socket.on('send_message', async (data) => {
      try {
        const { rfqId, senderId, receiverId, message, offerDetails } = data;

        if (!rfqId || !senderId || !message) {
          return socket.emit('error', { message: 'Missing required message parameters' });
        }

        // Save message to database
        const newMsg = await Message.create({
          rfq: rfqId,
          sender: senderId,
          receiver: receiverId,
          message,
          offerDetails: offerDetails || { isCounterOffer: false },
        });

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('sender', 'name email role avatar')
          .populate('receiver', 'name email role avatar');

        // Broadcast to RFQ room
        io.to(`rfq_${rfqId}`).emit('receive_message', populatedMsg);

        // If it's a counter-offer, update the RFQ current price
        if (offerDetails && offerDetails.isCounterOffer && offerDetails.pricePerUnit) {
          const rfq = await RFQ.findById(rfqId);
          if (rfq) {
            rfq.status = 'countered';
            rfq.currentOfferedPrice = offerDetails.pricePerUnit;
            rfq.lastOfferedBy = senderId;
            rfq.counterOffers.push({
              offeredBy: senderId,
              role: data.role || 'supplier',
              pricePerUnit: offerDetails.pricePerUnit,
              quantity: offerDetails.quantity || rfq.quantity,
              leadTimeDays: offerDetails.leadTimeDays || 7,
              notes: message,
            });
            await rfq.save();

            // Emit RFQ update event to all in the room
            io.to(`rfq_${rfqId}`).emit('rfq_updated', {
              rfqId,
              status: 'countered',
              currentOfferedPrice: offerDetails.pricePerUnit,
              lastOfferedBy: senderId,
            });
          }
        }
      } catch (err) {
        console.error('[Socket send_message Error]', err);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ rfqId, userName }) => {
      socket.to(`rfq_${rfqId}`).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ rfqId }) => {
      socket.to(`rfq_${rfqId}`).emit('user_stop_typing');
    });

    // Offer acceptance / rejection broadcast
    socket.on('offer_decision', ({ rfqId, decision, acceptedPrice }) => {
      io.to(`rfq_${rfqId}`).emit('offer_decision_updated', {
        rfqId,
        decision,
        acceptedPrice,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
