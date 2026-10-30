import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FileText,
  Truck,
  Download,
  Calendar,
  Building2,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { fetchOrders } from '../store/slices/orderSlice';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { items: orders, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleDownloadInvoice = (orderId, orderNumber, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('bulkconnect_token');
    // Open download link directly
    window.open(`/api/orders/${orderId}/invoice?token=${token}`, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Confirmed</span>;
      case 'processing':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Processing</span>;
      case 'shipped':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">In Transit</span>;
      case 'delivered':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Delivered</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-black text-slate-900">
                {user?.role === 'supplier' ? 'Supplier Orders & Dispatch Log' : 'My B2B Bulk Orders & Invoices'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track consignments, dispatch logistics, and download authenticated tax invoices
            </p>
          </div>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading order records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse our verified wholesale catalog to start placing bulk orders.
            </p>
            <Link
              to="/catalog"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-slate-900">{order.orderNumber}</span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                        <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Terms: {order.paymentMethod?.toUpperCase()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => handleDownloadInvoice(order._id, order.orderNumber, e)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download Tax Invoice (PDF)</span>
                    </button>

                    <Link
                      to={`/orders/${order._id}`}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Track Shipment</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items & Shipping row */}
                <div className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.items?.map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=150&q=80'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border-2 border-white"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {order.items?.length} Bulk Item{order.items?.length > 1 ? 's' : ''} (
                        {order.items?.reduce((sum, i) => sum + i.quantity, 0)} Total Units)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Consignee: {order.shippingAddress?.companyName}
                      </p>
                    </div>
                  </div>

                  {/* Shipment Tracking Snapshot */}
                  <div className="text-right">
                    <div className="text-xs">
                      {order.shipment?.trackingId ? (
                        <div className="flex items-center space-x-1 text-slate-700 font-semibold justify-end">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{order.shipment.carrier}: {order.shipment.trackingId}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium">Awaiting Dispatch Tracking</span>
                      )}
                    </div>
                    <p className="text-base font-black text-slate-900 mt-0.5">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
