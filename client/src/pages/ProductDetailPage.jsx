import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShieldCheck,
  Building2,
  Clock,
  Truck,
  CheckCircle2,
  ShoppingBag,
  MessageSquareText,
  Scale,
  Share2,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight
} from 'lucide-react';
import { fetchProductById, addToCompare } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { createRFQ } from '../store/slices/rfqSlice';
import TieredPriceCalculator from '../components/common/TieredPriceCalculator';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct: product, loading } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedQty, setSelectedQty] = useState(10);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  // RFQ Modal State
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqQty, setRfqQty] = useState(50);
  const [rfqTargetPrice, setRfqTargetPrice] = useState(0);
  const [rfqNotes, setRfqNotes] = useState('');
  const [rfqLocation, setRfqLocation] = useState('');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccessMsg, setRfqSuccessMsg] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setSelectedQty(product.moq || 10);
      setRfqQty(product.moq || 50);
      setRfqTargetPrice(Math.round((product.basePrice || 1000) * 0.85)); // 15% discount suggested default target
    }
  }, [product]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleCalculatorChange = (qty, unitPrice) => {
    setSelectedQty(qty);
    setCurrentPrice(unitPrice);
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity: selectedQty,
      })
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleOpenRFQ = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRfqModalOpen(true);
  };

  const handleSubmitRFQ = async (e) => {
    e.preventDefault();
    setRfqSubmitting(true);
    setRfqSuccessMsg('');

    try {
      const res = await dispatch(
        createRFQ({
          productId: product._id,
          quantity: rfqQty,
          targetPricePerUnit: rfqTargetPrice,
          notes: rfqNotes,
          deliveryLocation: rfqLocation,
        })
      ).unwrap();

      setRfqSubmitting(false);
      setRfqSuccessMsg('RFQ successfully submitted to supplier! Redirecting to live negotiation room...');
      setTimeout(() => {
        setRfqModalOpen(false);
        navigate(`/rfq/${res._id}`);
      }, 1500);
    } catch (err) {
      setRfqSubmitting(false);
      setRfqSuccessMsg(typeof err === 'string' ? err : 'Failed to submit RFQ');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link to="/catalog" className="hover:text-blue-600">Wholesale Catalog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium truncate max-w-sm">{product.name}</span>
        </div>

        {/* Main Grid: Left Gallery + Details, Right Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Images + Specs) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Gallery */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="relative h-96 bg-slate-100 rounded-xl overflow-hidden mb-3">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center space-x-1 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>GST Verified Supplier</span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                        selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Overview & Description */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-3">Product Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Specifications Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Technical Specifications</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">HSN / Commodity Code</span>
                  <span className="text-sm font-bold text-slate-900">{product.hsnCode}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Applicable GST / Tax Rate</span>
                  <span className="text-sm font-bold text-slate-900">{product.taxPercent}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Lead Time to Dispatch</span>
                  <span className="text-sm font-bold text-slate-900">{product.leadTimeDays} business days</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Ready Factory Stock</span>
                  <span className="text-sm font-bold text-emerald-700">{product.stock} {product.unit} available</span>
                </div>
                {product.specifications?.map((spec, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">{spec.key}</span>
                    <span className="text-sm font-bold text-slate-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Supplier Information Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{product.company?.name}</h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500">
                      Tax ID / GST: <span className="font-semibold text-slate-700">{product.company?.taxId}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Location: {product.company?.address?.city}, {product.company?.address?.state} • Est. {product.company?.establishedYear || 2015}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    ★ {product.company?.rating || 4.9} Trust Score
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Buy Box, Tiered Calculator, RFQ trigger) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs sticky top-20">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {product.brand}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Item SKU: <span className="font-mono text-slate-700">{product.sku}</span>
              </p>

              {/* Tiered Price Calculator Component */}
              <div className="my-5">
                <TieredPriceCalculator
                  product={product}
                  initialQty={selectedQty}
                  onQuantityChange={handleCalculatorChange}
                />
              </div>

              {/* Add to Cart Notification */}
              {addedToast && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Added {selectedQty} {product.unit} to Wholesale Cart!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Bulk Order to Cart</span>
                </button>

                <button
                  onClick={handleOpenRFQ}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <MessageSquareText className="w-4 h-4 text-amber-400" />
                  <span>Request Custom RFQ (Negotiate Price)</span>
                </button>

                <div className="flex items-center justify-center space-x-4 pt-2 text-xs text-slate-500">
                  <button
                    onClick={() => dispatch(addToCompare(product))}
                    className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare Specs</span>
                  </button>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>B2B Freight Assured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Trigger Modal */}
      {rfqModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Request For Quotation (RFQ)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Initiate a direct wholesale price negotiation with {product.company?.name}
            </p>

            <form onSubmit={handleSubmitRFQ} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product
                </label>
                <input
                  type="text"
                  disabled
                  value={product.name}
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Quantity ({product.unit})
                  </label>
                  <input
                    type="number"
                    min={product.moq}
                    value={rfqQty}
                    onChange={(e) => setRfqQty(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Min MOQ: {product.moq}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Price / Unit (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={rfqTargetPrice}
                    onChange={(e) => setRfqTargetPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Catalog Tier: ₹{product.basePrice}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bhiwandi Central Warehouse, Mumbai"
                  value={rfqLocation}
                  onChange={(e) => setRfqLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Negotiation Notes / Specific Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention delivery timelines, batch shipping, customized packaging or payment terms..."
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {rfqSuccessMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                    rfqSuccessMsg.includes('success')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{rfqSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRfqModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rfqSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer"
                >
                  {rfqSubmitting ? 'Submitting...' : 'Send RFQ to Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
