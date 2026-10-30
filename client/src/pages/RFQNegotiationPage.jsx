import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  MessageSquareText,
  Send,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShoppingBag,
  Building2,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  fetchRFQs,
  fetchRFQById,
  submitCounterOffer,
  acceptRFQOffer,
  fetchChatMessages,
  addSocketMessage,
  updateRFQFromSocket,
} from '../store/slices/rfqSlice';
import { addToCart } from '../store/slices/cartSlice';

const RFQNegotiationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: rfqs, currentRFQ: rfq, messages, loading } = useSelector((state) => state.rfq);
  const { user } = useSelector((state) => state.auth);

  const [inputMessage, setInputMessage] = useState('');
  const [showCounterBox, setShowCounterBox] = useState(false);
  const [counterPrice, setCounterPrice] = useState(0);
  const [counterQty, setCounterQty] = useState(0);
  const [counterLeadTime, setCounterLeadTime] = useState(7);
  const [counterNotes, setCounterNotes] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io('/', {
      transports: ['websocket', 'polling'],
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch RFQs list
  useEffect(() => {
    dispatch(fetchRFQs());
  }, [dispatch]);

  // If ID in URL or pick first
  useEffect(() => {
    const targetId = id || (rfqs.length > 0 ? rfqs[0]._id : null);
    if (targetId) {
      dispatch(fetchRFQById(targetId));
      dispatch(fetchChatMessages(targetId));

      if (socketRef.current) {
        socketRef.current.emit('join_rfq', { rfqId: targetId, userId: user?._id });
      }
    }
  }, [dispatch, id, rfqs.length]);

  // Socket event listeners
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('receive_message', (msg) => {
      dispatch(addSocketMessage(msg));
    });

    socketRef.current.on('rfq_updated', (data) => {
      dispatch(updateRFQFromSocket(data));
      // Refresh RFQ state
      if (rfq?._id) dispatch(fetchRFQById(rfq._id));
    });

    return () => {
      socketRef.current.off('receive_message');
      socketRef.current.off('rfq_updated');
    };
  }, [dispatch, rfq?._id]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (rfq) {
      setCounterPrice(rfq.currentOfferedPrice || 0);
      setCounterQty(rfq.quantity || 0);
    }
  }, [rfq]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !rfq) return;

    const isBuyer = rfq.buyer?._id === user?._id;
    const receiverId = isBuyer ? rfq.supplier?._id : rfq.buyer?._id;

    socketRef.current.emit('send_message', {
      rfqId: rfq._id,
      senderId: user._id,
      receiverId,
      message: inputMessage,
      offerDetails: { isCounterOffer: false },
    });

    setInputMessage('');
  };

  const handleSendCounterOffer = async (e) => {
    e.preventDefault();
    if (!rfq || !counterPrice) return;

    const isBuyer = rfq.buyer?._id === user?._id;
    const receiverId = isBuyer ? rfq.supplier?._id : rfq.buyer?._id;

    // Send via Socket.io
    socketRef.current.emit('send_message', {
      rfqId: rfq._id,
      senderId: user._id,
      receiverId,
      message: `Submitted Counter-Offer: ₹${counterPrice}/unit for ${counterQty} units. ${counterNotes}`,
      role: user.role,
      offerDetails: {
        isCounterOffer: true,
        pricePerUnit: Number(counterPrice),
        quantity: Number(counterQty),
        leadTimeDays: Number(counterLeadTime),
      },
    });

    setShowCounterBox(false);
    setCounterNotes('');
  };

  const handleAcceptOffer = async () => {
    if (!rfq) return;
    await dispatch(acceptRFQOffer(rfq._id)).unwrap();
    if (socketRef.current) {
      socketRef.current.emit('offer_decision', {
        rfqId: rfq._id,
        decision: 'accepted',
        acceptedPrice: rfq.currentOfferedPrice,
      });
    }
    dispatch(fetchRFQById(rfq._id));
  };

  const handleAddNegotiatedToCart = () => {
    if (!rfq || !rfq.product) return;
    dispatch(
      addToCart({
        product: rfq.product,
        quantity: rfq.quantity,
        isRfq: true,
        rfqPrice: rfq.currentOfferedPrice,
        rfqId: rfq._id,
      })
    );
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center space-x-2">
            <MessageSquareText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">RFQ Live Negotiation Workspace</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time B2B counter-offers, terms agreement, and direct custom order generation
          </p>
        </div>

        {/* Master-Detail Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[780px]">
          
          {/* Left Column: RFQs List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Active Negotiations ({rfqs.length})
              </span>
              <button
                onClick={() => dispatch(fetchRFQs())}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {rfqs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active RFQs. Request a quotation from any wholesale product page.
                </div>
              ) : (
                rfqs.map((item) => {
                  const isSelected = rfq?._id === item._id;
                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        navigate(`/rfq/${item._id}`);
                        dispatch(fetchRFQById(item._id));
                        dispatch(fetchChatMessages(item._id));
                      }}
                      className={`p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/60 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                          {item.product?.name || 'Bulk Inquiry'}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            item.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'countered'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <span>{item.quantity} {item.product?.unit || 'units'}</span>
                        <span className="font-bold text-slate-900">
                          ₹{item.currentOfferedPrice?.toLocaleString('en-IN')}/unit
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{item.rfqNumber}</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Negotiation Console & Real-time Chat */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
            {rfq ? (
              <>
                {/* Top Action Bar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">
                        {rfq.product?.name}
                      </span>
                      <span className="text-xs font-mono text-slate-500">({rfq.rfqNumber})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Buyer: <span className="font-semibold text-slate-800">{rfq.buyerCompany?.name || rfq.buyer?.name}</span> • Supplier: <span className="font-semibold text-slate-800">{rfq.supplierCompany?.name || rfq.supplier?.name}</span>
                    </p>
                  </div>

                  {/* Pricing Badge & Decision Buttons */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right pr-3 border-r border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Current Agreed Rate</span>
                      <span className="text-base font-black text-blue-700">
                        ₹{rfq.currentOfferedPrice?.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500"> / {rfq.product?.unit || 'unit'}</span>
                      </span>
                    </div>

                    {rfq.status === 'accepted' ? (
                      <button
                        onClick={handleAddNegotiatedToCart}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Order at Negotiated Rate</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleAcceptOffer}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Offer</span>
                        </button>
                        <button
                          onClick={() => setShowCounterBox(!showCounterBox)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Counter Offer</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Counter Offer Drawer / Form */}
                {showCounterBox && (
                  <form
                    onSubmit={handleSendCounterOffer}
                    className="p-4 bg-amber-50 border-b border-amber-200 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-amber-900">
                        Submit Back-and-Forth Counter Quotation
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCounterBox(false)}
                        className="text-amber-700 hover:text-amber-900 text-xs font-bold"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                          Counter Price / Unit (₹)
                        </label>
                        <input
                          type="number"
                          value={counterPrice}
                          onChange={(e) => setCounterPrice(Number(e.target.value))}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                          Quantity ({rfq.product?.unit})
                        </label>
                        <input
                          type="number"
                          value={counterQty}
                          onChange={(e) => setCounterQty(Number(e.target.value))}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                          Lead Time (Days)
                        </label>
                        <input
                          type="number"
                          value={counterLeadTime}
                          onChange={(e) => setCounterLeadTime(Number(e.target.value))}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add terms, dispatch assurances, or bulk justification..."
                        value={counterNotes}
                        onChange={(e) => setCounterNotes(e.target.value)}
                        className="flex-1 text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Broadcast Counter Offer
                      </button>
                    </div>
                  </form>
                )}

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                  {messages.map((msg, idx) => {
                    const isMe = msg.sender?._id === user?._id;
                    const isCounter = msg.offerDetails?.isCounterOffer;

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                          {msg.sender?.name} ({msg.sender?.role}) • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isCounter
                              ? 'bg-amber-50 border border-amber-200 text-slate-900 shadow-xs'
                              : isMe
                              ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                          }`}
                        >
                          {isCounter && (
                            <div className="mb-2 pb-2 border-b border-amber-200/80 flex items-center justify-between">
                              <span className="font-extrabold text-amber-900 flex items-center space-x-1">
                                <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
                                <span>OFFER: ₹{msg.offerDetails.pricePerUnit} / unit</span>
                              </span>
                              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                                Qty: {msg.offerDetails.quantity}
                              </span>
                            </div>
                          )}
                          <p>{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Type counter offer notes, delivery requirements, or technical queries..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquareText className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Select an RFQ from the left to start live negotiation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQNegotiationPage;
