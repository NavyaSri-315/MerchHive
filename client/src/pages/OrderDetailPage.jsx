import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText,
  Truck,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  Edit3
} from 'lucide-react';
import { fetchOrderById, updateShipmentStatus } from '../store/slices/orderSlice';

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  // Supplier Dispatch Form State
  const [carrier, setCarrier] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [courierNotes, setCourierNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (order) {
      setCarrier(order.shipment?.carrier || 'Blue Dart Surface Express');
      setTrackingId(order.shipment?.trackingId || '');
      setOrderStatus(order.orderStatus || 'processing');
      setCourierNotes(order.shipment?.courierNotes || '');
    }
  }, [order]);

  const handleDownloadInvoice = () => {
    window.open(`/api/orders/${order._id}/invoice`, '_blank');
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg('');

    try {
      await dispatch(
        updateShipmentStatus({
          id: order._id,
          trackingData: {
            carrier,
            trackingId,
            orderStatus,
            courierNotes,
          },
        })
      ).unwrap();
      setIsUpdating(false);
      setUpdateMsg('Shipment details updated successfully!');
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      setIsUpdating(false);
      setUpdateMsg('Failed to update shipment');
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isSupplier = user?.role === 'supplier' || user?.role === 'superadmin';

  // Status timeline steps
  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Tax invoice generated' },
    { key: 'processing', label: 'Manufacturing / Packing', desc: 'Factory fulfillment' },
    { key: 'shipped', label: 'Dispatched & In Transit', desc: 'Handed to courier' },
    { key: 'delivered', label: 'Delivered', desc: 'Consignment received' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Orders List</span>
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900">{order.orderNumber}</h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>

        {/* Tracking Stepper Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            Consignment Tracking Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {steps.map((step, idx) => {
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="flex flex-col items-start relative">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isPassed
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-blue-700' : isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-10">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {order.shipment?.trackingId && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">
                  Carrier: {order.shipment.carrier} | AWB / Tracking ID: {order.shipment.trackingId}
                </span>
              </div>
              {order.shipment.courierNotes && (
                <span className="text-slate-500 italic">
                  Note: "{order.shipment.courierNotes}"
                </span>
              )}
            </div>
          )}
        </div>

        {/* Supplier Dispatch Form (Visible for Supplier/Admin) */}
        {isSupplier && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Supplier Dispatch Console (Update Tracking & Logistics)
              </h3>
            </div>

            <form onSubmit={handleUpdateShipment} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Logistics Carrier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. Blue Dart / Delhivery / GATI"
                  className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Consignment / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. BLUEDART-984210"
                  className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Order Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing / Packing</option>
                  <option value="shipped">Shipped & In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Courier Notes / Driver Info
                </label>
                <input
                  type="text"
                  value={courierNotes}
                  onChange={(e) => setCourierNotes(e.target.value)}
                  placeholder="e.g. Dispatched from Mumbai depot"
                  className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-4 flex items-center justify-between pt-2">
                {updateMsg && (
                  <span className="text-xs font-semibold text-emerald-400">{updateMsg}</span>
                )}
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Update Courier Tracking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Two-Column Details: Items and Consignee Address */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Order Items Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Purchased Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Item Description</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">Unit Rate</th>
                    <th className="pb-3 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            {item.isRfqNegotiated && (
                              <span className="inline-block bg-purple-50 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-purple-200">
                                Negotiated RFQ Price
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-slate-500">{item.sku}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 text-right text-slate-700">
                        ₹{item.unitPrice?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        ₹{item.totalPrice?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{order.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-bold text-slate-900">₹{order.taxAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Freight / Shipping:</span>
                  <span className="font-bold text-slate-900">
                    {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Amount:</span>
                  <span className="text-base font-black text-blue-700">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Consignee & Supplier Information */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">Shipping & Consignee</h4>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <p className="font-bold text-slate-900">{order.shippingAddress?.companyName}</p>
                <p>Attn: {order.shippingAddress?.contactName}</p>
                <p>Tax ID / GST: <span className="font-mono text-slate-800">{order.shippingAddress?.gstNumber || 'N/A'}</span></p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Supplier Entity */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">Supplied By</h4>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <p className="font-bold text-slate-900">{order.supplierCompany?.name || 'Authorized Supplier'}</p>
                <p>GSTIN: <span className="font-mono text-slate-800">{order.supplierCompany?.taxId}</span></p>
                <p>Dispatch Facility: {order.supplierCompany?.address?.city}, {order.supplierCompany?.address?.state}</p>
              </div>
            </div>

            {/* B2B Terms Box */}
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-200/60 text-xs">
              <h4 className="font-bold text-blue-900 mb-1">Corporate Payment Terms</h4>
              <p className="text-slate-600">
                Method: <span className="font-bold text-slate-800">{order.paymentMethod?.toUpperCase()}</span>
              </p>
              <p className="text-slate-600 mt-1">
                Status: <span className="font-bold text-emerald-700 uppercase">{order.paymentStatus}</span>
              </p>
              {order.creditTerms?.dueDate && (
                <p className="text-blue-800 font-semibold mt-2">
                  Due Date: {new Date(order.creditTerms.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
