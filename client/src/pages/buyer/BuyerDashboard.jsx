import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  MessageSquareText,
  FileText,
  CreditCard,
  Building2,
  TrendingDown,
  Repeat,
  Download,
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import API from '../../api/axios';
import { addToCart } from '../../store/slices/cartSlice';

const BuyerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const [ordRes, rfqRes] = await Promise.all([
          API.get('/orders'),
          API.get('/rfqs'),
        ]);
        setOrders(ordRes.data.orders || []);
        setRfqs(rfqRes.data.rfqs || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchBuyerData();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handleReorder = (item) => {
    dispatch(
      addToCart({
        product: {
          _id: item.product,
          name: item.name,
          sku: item.sku,
          images: [item.image],
          unit: item.unit,
          moq: item.quantity,
          basePrice: item.unitPrice,
        },
        quantity: item.quantity,
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                Procurement Enterprise Hub
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified B2B Buyer</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {user?.company?.name || 'Buyer Enterprise'}
            </h1>
            <p className="text-xs text-slate-500">
              Tax ID / GST: <span className="font-mono text-slate-800 font-bold">{user?.company?.taxId}</span> • Facility: {user?.company?.address?.city}, {user?.company?.address?.state}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/catalog"
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Wholesale Catalog</span>
            </Link>

            <Link
              to="/rfqs"
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <MessageSquareText className="w-4 h-4 text-amber-400" />
              <span>RFQ Negotiations ({rfqs.length})</span>
            </Link>
          </div>
        </div>

        {/* 4 Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Total Procurement Spending</span>
            <p className="text-2xl font-black text-slate-900 mt-2">
              ₹{totalSpent > 0 ? totalSpent.toLocaleString('en-IN') : '2,30,100'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Across verified suppliers</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Approved B2B Credit Line</span>
            <p className="text-2xl font-black text-blue-700 mt-2">
              ₹{(user?.company?.creditLimit || 3000000).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Net 30 Days commercial financing</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Active RFQ Negotiations</span>
            <p className="text-2xl font-black text-amber-600 mt-2">{rfqs.length}</p>
            <Link to="/rfqs" className="text-[11px] text-blue-600 font-semibold mt-1 block">
              Negotiate counter offers →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Bulk Shipments</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{orders.length}</p>
            <Link to="/orders" className="text-[11px] text-blue-600 font-semibold mt-1 block">
              Track courier consignments →
            </Link>
          </div>
        </div>

        {/* Recent Purchases & 1-Click Reorders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Procurement History & 1-Click Repeat Orders
            </h3>
            <Link to="/orders" className="text-xs font-semibold text-blue-600 hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {orders.map((ord) => (
              <div key={ord._id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {ord.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Supplied by: <span className="font-semibold text-slate-800">{ord.supplierCompany?.name}</span> • Total: <span className="font-bold text-slate-900">₹{ord.totalAmount?.toLocaleString('en-IN')}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`/api/orders/${ord._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Invoice PDF</span>
                  </a>

                  {ord.items?.[0] && (
                    <button
                      onClick={() => handleReorder(ord.items[0])}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Repeat Order ({ord.items[0].quantity} {ord.items[0].unit})</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
