import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Building2,
  FileCheck2,
  ChevronLeft
} from 'lucide-react';
import {
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  selectCartSubtotal,
  selectCartTax,
  selectCartShipping,
  selectCartDiscount,
  selectCartTotal,
} from '../store/slices/cartSlice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, couponCode, discountPercent } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const shipping = useSelector(selectCartShipping);
  const discount = useSelector(selectCartDiscount);
  const total = useSelector(selectCartTotal);

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    dispatch(applyCoupon(inputCoupon));
    if (inputCoupon.toUpperCase() === 'MERCHHIVE10' || inputCoupon.toUpperCase() === 'BULKCONNECT10' || inputCoupon.toUpperCase() === 'B2BTRADE5') {
      setCouponError('');
    } else {
      setCouponError('Invalid B2B coupon code. Try: MERCHHIVE10 or B2BTRADE5');
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Bulk Cart is Empty</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md">
          Explore verified manufacturer catalogs or review your accepted RFQ quotations to initiate bulk procurement.
        </p>
        <Link
          to="/catalog"
          className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Browse Wholesale Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Wholesale Procurement Cart</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review bulk order quantities, volume discounts, and verified supplier details
            </p>
          </div>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear All Items
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.rfqId || 'std'}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=300&q=80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div>
                    {item.isRfq && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 mb-1">
                        RFQ Negotiated Rate
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku}</p>
                    <p className="text-xs font-bold text-blue-700 mt-1">
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                      <span className="text-[10px] font-normal text-slate-500"> / {item.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Quantity:</span>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                      {!item.isRfq && (
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                quantity: item.quantity - 10,
                                rfqId: item.rfqId,
                              })
                            )
                          }
                          disabled={item.quantity <= item.moq}
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>
                      )}
                      <input
                        type="number"
                        min={item.moq}
                        disabled={item.isRfq}
                        value={item.quantity}
                        onChange={(e) =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: Number(e.target.value),
                              rfqId: item.rfqId,
                            })
                          )
                        }
                        className="w-16 text-center text-xs font-bold text-slate-900 py-1 focus:outline-hidden disabled:bg-slate-50"
                      />
                      {!item.isRfq && (
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                quantity: item.quantity + 10,
                                rfqId: item.rfqId,
                              })
                            )
                          }
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block mb-1">Item Total:</span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          productId: item.productId,
                          rfqId: item.rfqId,
                        })
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Checkout Box */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Coupon Code Input */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1 mb-2">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Apply B2B Trade Coupon</span>
              </label>
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. MERCHHIVE10"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {discountPercent > 0 && (
                <p className="text-xs font-semibold text-emerald-600 mt-2">
                  ✓ {discountPercent}% B2B Trade Discount Applied!
                </p>
              )}
              {couponError && (
                <p className="text-xs text-red-600 mt-2">{couponError}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Procurement Cost Summary
              </h3>

              <div className="space-y-3 my-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.length} bulk line items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Standard GST (18%)</span>
                  <span className="font-bold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Freight & Logistics</span>
                  <span className="font-bold text-slate-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE (Above ₹1 Lakh)</span>
                    ) : (
                      `₹${shipping.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Trade Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Estimated Total Payable</span>
                  <span className="text-xl font-black text-blue-700">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Proceed to B2B Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center space-x-1.5 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GST Tax Invoice generated immediately on confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
