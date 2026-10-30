import React, { useState, useEffect } from 'react';
import { Layers, TrendingDown, Check, ArrowRight } from 'lucide-react';

const TieredPriceCalculator = ({ product, onQuantityChange, initialQty }) => {
  const moq = product?.moq || 1;
  const unit = product?.unit || 'units';
  const tiers = product?.tieredPricing || [];

  const [quantity, setQuantity] = useState(initialQty || moq);

  useEffect(() => {
    if (initialQty && initialQty >= moq) {
      setQuantity(initialQty);
    }
  }, [initialQty, moq]);

  // Determine active tier and unit price
  const getActiveTier = (qty) => {
    if (!tiers || tiers.length === 0) return { pricePerUnit: product?.basePrice || 0 };
    const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
    for (const tier of sorted) {
      if (qty >= tier.minQuantity) {
        if (!tier.maxQuantity || qty <= tier.maxQuantity) {
          return tier;
        }
      }
    }
    return tiers[0];
  };

  const activeTier = getActiveTier(quantity);
  const currentUnitPrice = activeTier.pricePerUnit;
  const basePrice = tiers.length > 0 ? tiers[0].pricePerUnit : currentUnitPrice;
  const savingsPercent = basePrice > 0 ? Math.round(((basePrice - currentUnitPrice) / basePrice) * 100) : 0;
  const estimatedSubtotal = quantity * currentUnitPrice;
  const estimatedTax = Math.round(estimatedSubtotal * 0.18);
  const estimatedTotal = estimatedSubtotal + estimatedTax;

  const handleQtyChange = (val) => {
    const num = Math.max(moq, Number(val) || moq);
    setQuantity(num);
    if (onQuantityChange) {
      onQuantityChange(num, currentUnitPrice);
    }
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-700" />
          <h4 className="text-sm font-bold text-slate-900">Volume Tiered Pricing Calculator</h4>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          MOQ: {moq} {unit}
        </span>
      </div>

      {/* Tiers Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
        {tiers.map((tier, idx) => {
          const isActive =
            quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity);
          const tierDiscount =
            basePrice > 0 ? Math.round(((basePrice - tier.pricePerUnit) / basePrice) * 100) : 0;

          return (
            <div
              key={idx}
              onClick={() => handleQtyChange(tier.minQuantity)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-500/30'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
              }`}
            >
              {isActive && (
                <div className="absolute -top-2 right-2 bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Active Tier
                </div>
              )}
              <p className={`text-xs font-medium ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                {tier.minQuantity} {tier.maxQuantity ? `- ${tier.maxQuantity}` : '+'} {unit}
              </p>
              <p className="text-base font-extrabold mt-1">
                ₹{tier.pricePerUnit.toLocaleString('en-IN')}
                <span className={`text-[10px] font-normal ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                  {' '}/ {unit.slice(0, -1) || unit}
                </span>
              </p>
              {tierDiscount > 0 && (
                <span
                  className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-700/60 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Save {tierDiscount}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Quantity Stepper and Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-700 shrink-0">
            Selected Quantity:
          </label>
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleQtyChange(quantity - 10)}
              disabled={quantity <= moq}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold disabled:opacity-40 cursor-pointer"
            >
              -10
            </button>
            <input
              type="number"
              min={moq}
              value={quantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              className="w-20 text-center text-sm font-bold text-slate-900 py-1.5 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleQtyChange(quantity + 10)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
            >
              +10
            </button>
          </div>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>

        {/* Live Calculation preview */}
        <div className="flex items-center space-x-4 text-right w-full sm:w-auto justify-end">
          {savingsPercent > 0 && (
            <div className="flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{savingsPercent}% Wholesale Discount</span>
            </div>
          )}
          <div>
            <p className="text-[11px] text-slate-500">Effective Unit Price</p>
            <p className="text-sm font-black text-blue-700">
              ₹{currentUnitPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Est. Total (+18% GST)</p>
            <p className="text-sm font-black text-slate-900">
              ₹{estimatedTotal.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TieredPriceCalculator;
