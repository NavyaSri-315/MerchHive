import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle,
  Truck,
  ArrowRight,
  FileText,
  AlertCircle,
  CalendarCheck
} from 'lucide-react';
import {
  selectCartSubtotal,
  selectCartTax,
  selectCartShipping,
  selectCartDiscount,
  selectCartTotal,
  clearCart,
} from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const shipping = useSelector(selectCartShipping);
  const discount = useSelector(selectCartDiscount);
  const total = useSelector(selectCartTotal);

  const [paymentMethod, setPaymentMethod] = useState('b2b_credit_terms');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Shipping Form State initialized with user's company defaults
  const [shippingData, setShippingData] = useState({
    contactName: user?.name || '',
    companyName: user?.company?.name || 'Metro Retail Mart Chain India Pvt Ltd',
    gstNumber: user?.company?.taxId || '27AABCM8899L1ZU',
    street: user?.company?.address?.street || 'Plot 104, Commerce Center, Link Road',
    city: user?.company?.address?.city || 'Mumbai',
    state: user?.company?.address?.state || 'Maharashtra',
    country: 'India',
    zip: user?.company?.address?.zip || '400053',
    phone: user?.phone || '+91 9876543210',
  });

  const handleInputChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        items,
        shippingAddress: shippingData,
        paymentMethod,
        notes: `Procurement Order by ${shippingData.companyName} under ${paymentMethod === 'b2b_credit_terms' ? 'Net-30 Financing' : 'Prepaid Gateway'}.`,
      };

      const created = await dispatch(createOrder(orderPayload)).unwrap();
      dispatch(clearCart());
      setLoading(false);
      navigate(`/orders/${created._id}`);
    } catch (err) {
      setLoading(false);
      setErrorMsg(typeof err === 'string' ? err : 'Order placement failed. Check your verification status.');
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-2">B2B Wholesale Checkout</h1>
        <p className="text-xs text-slate-500 mb-8">
          Complete company shipping credentials and select corporate payment terms
        </p>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Shipping & Payment Method */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Business Consignee & Shipping Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Consignee Business & GST Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={shippingData.companyName}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax ID / GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={shippingData.gstNumber}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Authorised Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={shippingData.contactName}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warehouse / Delivery Address (Street & Building)
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={shippingData.street}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingData.city}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingData.state}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Postal / PIN Code
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={shippingData.zip}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="India"
                    className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* B2B Payment Method Selection */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Select Corporate Payment Terms
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                
                {/* B2B Credit Terms */}
                <div
                  onClick={() => setPaymentMethod('b2b_credit_terms')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'b2b_credit_terms'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CalendarCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Net 30 Days
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">B2B Trade Credit</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pay within 30 days of dispatch against GST invoice. Available for approved accounts.
                  </p>
                </div>

                {/* Razorpay / Stripe Gateway */}
                <div
                  onClick={() => setPaymentMethod('razorpay_stripe')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'razorpay_stripe'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                      Instant
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">Online Gateway</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Corporate Credit Cards, Net Banking, or UPI via Razorpay & Stripe integration.
                  </p>
                </div>

                {/* Direct Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building className="w-5 h-5 text-slate-600" />
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      NEFT / RTGS
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">Corporate Wire</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Direct bank wire transfer to escrow account upon proforma generation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Box */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs sticky top-20">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Items ({items.length})
              </h3>

              <div className="max-h-56 overflow-y-auto space-y-2.5 my-3 pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="truncate max-w-[180px]">
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.quantity} {item.unit} × ₹{item.unitPrice}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 py-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="font-bold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Freight:</span>
                  <span className="font-bold text-slate-900">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-slate-900">Total:</span>
                  <span className="text-xl font-black text-blue-700">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center space-x-1.5 my-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-4"
              >
                {loading ? (
                  <span>Generating Tax Invoice...</span>
                ) : (
                  <>
                    <span>Confirm & Generate Invoice</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
