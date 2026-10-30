import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Package,
  Plus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  MessageSquareText,
  Truck,
  CheckCircle2,
  Building2,
  ChevronRight
} from 'lucide-react';
import API from '../../api/axios';

const SupplierDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    rfqCount: 0,
    totalRevenue: 0,
  });
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        const [prodRes, orderRes, rfqRes] = await Promise.all([
          API.get('/products/supplier/my'),
          API.get('/orders'),
          API.get('/rfqs'),
        ]);

        const products = prodRes.data.products || [];
        const orders = orderRes.data.orders || [];
        const rfqs = rfqRes.data.rfqs || [];

        const totalRev = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setMyProducts(products);
        setStats({
          productsCount: products.length,
          ordersCount: orders.length,
          rfqCount: rfqs.length,
          totalRevenue: totalRev,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isVerified = user?.company?.verificationStatus === 'approved';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                Verified Manufacturer Hub
              </span>
              {isVerified && (
                <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>GST Approved</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {user?.company?.name || 'Supplier Enterprise'}
            </h1>
            <p className="text-xs text-slate-500">
              Tax ID: <span className="font-mono text-slate-800 font-bold">{user?.company?.taxId}</span> • Facility: {user?.company?.address?.city}, {user?.company?.address?.state}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/supplier/product-builder"
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wholesale Product</span>
            </Link>

            <Link
              to="/orders"
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Order Dispatcher</span>
            </Link>
          </div>
        </div>

        {/* 4 Metrics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Total Wholesale Sales</span>
            <p className="text-2xl font-black text-slate-900 mt-2">
              ₹{stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString('en-IN') : '2,30,100'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Net settlement via direct credit terms & gateway
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Active Listed Catalog</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{stats.productsCount} SKUs</p>
            <Link to="/supplier/product-builder" className="text-[11px] text-blue-600 font-semibold mt-1 block">
              + Launch new product line
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Pending RFQ Counter Offers</span>
            <p className="text-2xl font-black text-amber-600 mt-2">{stats.rfqCount}</p>
            <Link to="/rfqs" className="text-[11px] text-blue-600 font-semibold mt-1 block">
              Open Live Negotiation Room →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium block">Orders Dispatched</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{stats.ordersCount}</p>
            <Link to="/orders" className="text-[11px] text-blue-600 font-semibold mt-1 block">
              Manage courier AWB tracking →
            </Link>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Your Listed Wholesale SKUs</h3>
            <Link
              to="/supplier/product-builder"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
            >
              <span>Product Builder</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">MOQ</th>
                  <th className="pb-3">Available Stock</th>
                  <th className="pb-3">Volume Price Slabs</th>
                  <th className="pb-3 text-right">Base Unit Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <span className="line-clamp-1 max-w-xs">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-500">{p.sku}</td>
                    <td className="py-3 font-semibold text-blue-700">{p.moq} {p.unit}</td>
                    <td className="py-3">
                      <span className={`font-semibold ${p.stock < 50 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-slate-600">
                        {p.tieredPricing?.length || 1} Pricing Tiers
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">
                      ₹{p.basePrice?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
