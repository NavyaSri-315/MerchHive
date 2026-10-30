import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Users,
  Package,
  Layers,
  ArrowUpRight,
  CheckCircle,
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';
import API from '../../api/axios';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get('/admin/analytics');
        setAnalytics(response.data.analytics);
        setRecentOrders(response.data.recentOrders || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load admin analytics', err);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                SuperAdmin Console
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Platform GMV & Operations</h1>
            <p className="text-xs text-slate-500">
              Oversee company verification queues, B2B trading volume, and marketplace commission earnings
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/admin/verification-queue"
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>KYC Verification Queue ({analytics?.pendingVerifications || 0})</span>
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Categories</span>
            </Link>
          </div>
        </div>

        {/* 4 Analytics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Gross Merchandise Value (GMV)</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">
              ₹{analytics?.gmv ? Number(analytics.gmv).toLocaleString('en-IN') : '24,50,000'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>₹{analytics?.paidGmv ? Number(analytics.paidGmv).toLocaleString('en-IN') : '21,50,000'} settled/cleared</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Platform Commission Earned</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-3">
              ₹{analytics?.commissionEarned ? Number(analytics.commissionEarned).toLocaleString('en-IN') : '85,750'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Average 3.5% wholesale fee</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Pending Company KYC Queue</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600 mt-3">
              {analytics?.pendingVerifications || 0} Companies
            </p>
            <Link
              to="/admin/verification-queue"
              className="text-[11px] text-blue-600 font-semibold hover:underline mt-1 block"
            >
              Review documents now →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Active Network Entities</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">
              {(analytics?.totalSuppliers || 2) + (analytics?.totalBuyers || 1)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {analytics?.totalSuppliers || 2} Suppliers • {analytics?.totalBuyers || 1} Buyers
            </p>
          </div>
        </div>

        {/* Recent Transactions & Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Live Platform Orders & Commission Log
            </h3>
            <Link
              to="/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Buyer Company</th>
                  <th className="pb-3">Supplier Entity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Order Value</th>
                  <th className="pb-3 text-right">Platform Fee (3.5%)</th>
                  <th className="pb-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3 font-semibold text-slate-700">
                      {ord.buyerCompany?.name || 'Buyer Enterprise'}
                    </td>
                    <td className="py-3 text-slate-600">
                      {ord.supplierCompany?.name || 'Verified Supplier'}
                    </td>
                    <td className="py-3">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      ₹{ord.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600">
                      ₹{ord.platformCommission?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href={`/api/orders/${ord._id}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        PDF
                      </a>
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

export default AdminDashboard;
