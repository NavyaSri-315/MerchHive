import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layers, ShieldCheck, Lock, Mail, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import { loginUser, setDemoUser } from '../store/slices/authSlice';
import API from '../api/axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirect = new URLSearchParams(location.search).get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      if (redirect) {
        navigate(`/${redirect}`);
      } else if (result.user.role === 'superadmin') {
        navigate('/admin');
      } else if (result.user.role === 'supplier') {
        navigate('/supplier');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    try {
      const res = await API.post('/auth/login', { email: demoEmail, password: demoPassword });
      dispatch(setDemoUser({ token: res.data.token, user: res.data.user }));
      if (res.data.user.role === 'superadmin') navigate('/admin');
      else if (res.data.user.role === 'supplier') navigate('/supplier');
      else navigate('/buyer');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Logo & Tagline */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Merch<span className="text-blue-700">Hive</span>
            </span>
          </Link>
          <h2 className="text-lg font-black text-slate-900 mt-2">Sign in to B2B Wholesale Portal</h2>
          <p className="text-xs text-slate-500">
            Access verified supplier catalogs, RFQs, and commercial credit terms
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
          <p className="font-bold text-amber-900 flex items-center space-x-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>1-Click Evaluator Demo Accounts:</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@bulkconnect.com', 'Admin@123')}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-800 text-[11px] font-bold text-left cursor-pointer"
            >
              👑 SuperAdmin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('purchasing@metroretail.com', 'Buyer@123')}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-800 text-[11px] font-bold text-left cursor-pointer"
            >
              🛒 Verified Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('supplier@apexind.com', 'Supplier@123')}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-800 text-[11px] font-bold text-left cursor-pointer"
            >
              🏭 Apex Pro Tools
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('sales@vortexelec.com', 'Supplier@123')}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-800 text-[11px] font-bold text-left cursor-pointer"
            >
              ⚡ Vortex Electronics
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business / Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="purchasing@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer text-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          New to MerchHive?{' '}
          <Link to="/register" className="font-bold text-blue-700 hover:underline">
            Register your enterprise
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
