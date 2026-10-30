import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  MessageSquareText,
  Layers,
  ShieldCheck,
  Building2,
  User,
  LogOut,
  ChevronDown,
  Scale,
  Sparkles,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { logout, setDemoUser } from '../../store/slices/authSlice';
import API from '../../api/axios';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const compareList = useSelector((state) => state.products.compareList);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/login');
  };

  // Quick Demo Login helper
  const handleQuickDemoSwitch = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      dispatch(setDemoUser({ token: response.data.token, user: response.data.user }));
      setDemoMenuOpen(false);
      // Navigate to role landing
      if (response.data.user.role === 'superadmin') navigate('/admin');
      else if (response.data.user.role === 'supplier') navigate('/supplier');
      else navigate('/buyer');
    } catch (err) {
      console.error('Demo switch failed', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                  Merch<span className="text-blue-700">Hive</span>
                </span>
                <span className="text-[10px] tracking-wide text-slate-500 font-medium hidden sm:inline">
                  B2B WHOLESALE TRADING
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/catalog"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors"
            >
              Wholesale Catalog
            </Link>

            <Link
              to="/compare"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors relative"
            >
              <span className="flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-slate-500" />
                <span>Compare</span>
                {compareList.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {compareList.length}
                  </span>
                )}
              </span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/rfqs"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
                >
                  <MessageSquareText className="w-4 h-4 text-slate-500" />
                  <span>RFQ Negotiations</span>
                </Link>

                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Orders & Invoices</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center space-x-3">

            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Switch between demo accounts to test full B2B lifecycle"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Switch Demo Role (1-Click)</p>
                    <p className="text-[11px] text-slate-500">Test platform capabilities as any user role</p>
                  </div>
                  
                  <button
                    onClick={() => handleQuickDemoSwitch('admin@bulkconnect.com', 'Admin@123')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <div>
                      <p className="font-semibold text-slate-800">Super Admin</p>
                      <p className="text-[10px] text-slate-500">Document verifications & Platform GMV</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickDemoSwitch('supplier@apexind.com', 'Supplier@123')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <p className="font-semibold text-slate-800">Supplier 1 (Apex Tools)</p>
                      <p className="text-[10px] text-slate-500">Verified manufacturer & order dispatcher</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickDemoSwitch('sales@vortexelec.com', 'Supplier@123')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <div>
                      <p className="font-semibold text-slate-800">Supplier 2 (Vortex Electronics)</p>
                      <p className="text-[10px] text-slate-500">Verified wholesale semiconductor vendor</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickDemoSwitch('info@zenithmfg.com', 'Supplier@123')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <div>
                      <p className="font-semibold text-slate-800">Supplier 3 (Zenith Garments)</p>
                      <p className="text-[10px] text-amber-600">Verification Pending in Admin queue</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickDemoSwitch('purchasing@metroretail.com', 'Buyer@123')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <div>
                      <p className="font-semibold text-slate-800">Buyer (Metro Retail Mart)</p>
                      <p className="text-[10px] text-slate-500">Places bulk orders & negotiates RFQs</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
              title="Bulk Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      {user?.company && (
                        <div className="mt-1 flex items-center space-x-1.5 text-xs text-blue-700 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate">{user?.company?.name}</span>
                        </div>
                      )}
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        Role: {user?.role}
                      </div>
                    </div>

                    {/* Role dashboard shortcut */}
                    {user?.role === 'superadmin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                      >
                        SuperAdmin Dashboard
                      </Link>
                    )}

                    {user?.role === 'supplier' && (
                      <Link
                        to="/supplier"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                      >
                        Supplier Workspace & Builder
                      </Link>
                    )}

                    {user?.role === 'buyer' && (
                      <Link
                        to="/buyer"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                      >
                        Buyer Procurement Hub
                      </Link>
                    )}

                    <Link
                      to="/rfqs"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                    >
                      My RFQ Negotiations
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                    >
                      Orders & Invoices
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                >
                  Register Business
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Wholesale Catalog
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Compare Products ({compareList.length})
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/rfqs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                RFQ Negotiations
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Orders & Invoices
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
