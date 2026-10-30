import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Scale, Trash2, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { removeFromCompare, clearCompare } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';

const ComparePage = () => {
  const dispatch = useDispatch();
  const { compareList } = useSelector((state) => state.products);

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Comparison Table is Empty</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md">
          Browse the wholesale catalog and click the scale icon on any product to compare specifications, volume tiers, and MOQ side-by-side.
        </p>
        <Link
          to="/catalog"
          className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Explore Wholesale Catalog
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
            <div className="flex items-center space-x-2">
              <Scale className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-black text-slate-900">Product Comparison Matrix</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Comparing {compareList.length} products across MOQ, tiered pricing slabs, lead times, and specifications
            </p>
          </div>
          <button
            onClick={() => dispatch(clearCompare())}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="mt-8 overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <tbody>
              {/* Product Visual Header Row */}
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="p-4 w-48 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Product
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 min-w-[220px] align-top">
                    <div className="relative">
                      <button
                        onClick={() => dispatch(removeFromCompare(product._id))}
                        className="absolute -top-1 -right-1 p-1 bg-white text-slate-400 hover:text-red-600 rounded-full shadow-xs border border-slate-200 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-xl border border-slate-200 mb-2"
                      />
                      <Link
                        to={`/product/${product._id}`}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        SKU: {product.sku}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Verified Supplier */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500">Supplier Entity</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-xs">
                    <div className="flex items-center space-x-1 font-semibold text-slate-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{product.company?.name || 'Verified Supplier'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      GSTIN: {product.company?.taxId || 'Verified'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* MOQ Row */}
              <tr className="border-b border-slate-100 bg-blue-50/20">
                <td className="p-4 text-xs font-bold text-slate-500">Minimum Order (MOQ)</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-xs font-black text-blue-700">
                    {product.moq} {product.unit}
                  </td>
                ))}
              </tr>

              {/* Base Price Row */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500">Starting Price</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-xs font-extrabold text-slate-900">
                    ₹{product.basePrice?.toLocaleString('en-IN')} / {product.unit}
                  </td>
                ))}
              </tr>

              {/* Tiered Price Slabs */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500">Volume Tier Slabs</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-xs">
                    <div className="space-y-1">
                      {product.tieredPricing?.map((tier, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-100"
                        >
                          <span className="text-slate-600">
                            {tier.minQuantity}{tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'} {product.unit}
                          </span>
                          <span className="font-bold text-slate-900">₹{tier.pricePerUnit}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Lead Time */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500">Dispatch Lead Time</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-xs font-medium text-slate-700">
                    {product.leadTimeDays} business days
                  </td>
                ))}
              </tr>

              {/* Tax Rate */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500">Applicable Tax (GST)</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-xs font-medium text-slate-700">
                    {product.taxPercent}%
                  </td>
                ))}
              </tr>

              {/* Ready Stock */}
              <tr className="border-b border-slate-100">
                <td className="p-4 text-xs font-bold text-slate-500">Factory Stock</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-xs font-semibold text-emerald-700">
                    {product.stock} {product.unit}
                  </td>
                ))}
              </tr>

              {/* Actions Row */}
              <tr>
                <td className="p-4 text-xs font-bold text-slate-500">Actions</td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4">
                    <button
                      onClick={() =>
                        dispatch(
                          addToCart({
                            product,
                            quantity: product.moq,
                          })
                        )
                      }
                      className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy MOQ ({product.moq})</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
