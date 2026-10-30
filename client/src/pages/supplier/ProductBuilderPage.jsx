import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  PackagePlus,
  Plus,
  Trash2,
  Layers,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { createProduct, fetchCategories } from '../../store/slices/productSlice';

const ProductBuilderPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: user?.company?.name || 'ApexPro Tooling',
    unit: 'pieces',
    moq: 10,
    stock: 500,
    leadTimeDays: 5,
    hsnCode: '84672100',
    taxPercent: 18,
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  });

  // Dynamic Tiered Pricing Slabs
  const [tieredPricing, setTieredPricing] = useState([
    { minQuantity: 10, maxQuantity: 49, pricePerUnit: 2500 },
    { minQuantity: 50, maxQuantity: 199, pricePerUnit: 2100 },
    { minQuantity: 200, maxQuantity: null, pricePerUnit: 1750 },
  ]);

  // Dynamic Specifications
  const [specifications, setSpecifications] = useState([
    { key: 'Material / Construction', value: 'Commercial Grade Hardened Alloy' },
    { key: 'Warranty Period', value: '2 Years Manufacturer Replacement' },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories, formData.category]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Tiered Pricing Helpers
  const handleTierChange = (index, field, value) => {
    const updated = [...tieredPricing];
    updated[index][field] = value === '' || value === null ? null : Number(value);
    setTieredPricing(updated);
  };

  const addTier = () => {
    const lastTier = tieredPricing[tieredPricing.length - 1];
    const newMin = (lastTier?.maxQuantity || lastTier?.minQuantity || 10) + 1;
    setTieredPricing([
      ...tieredPricing,
      { minQuantity: newMin, maxQuantity: null, pricePerUnit: Math.round((lastTier?.pricePerUnit || 1000) * 0.9) },
    ]);
  };

  const removeTier = (index) => {
    if (tieredPricing.length <= 1) return;
    setTieredPricing(tieredPricing.filter((_, i) => i !== index));
  };

  // Specification Helpers
  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const addSpec = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpec = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Ensure first tier minQuantity matches MOQ
    const sortedTiers = [...tieredPricing].sort((a, b) => a.minQuantity - b.minQuantity);
    if (sortedTiers[0].minQuantity !== Number(formData.moq)) {
      sortedTiers[0].minQuantity = Number(formData.moq);
    }

    try {
      const payload = {
        ...formData,
        moq: Number(formData.moq),
        stock: Number(formData.stock),
        leadTimeDays: Number(formData.leadTimeDays),
        taxPercent: Number(formData.taxPercent),
        images: [formData.imageUrl],
        tieredPricing: sortedTiers,
        specifications: specifications.filter((s) => s.key.trim() && s.value.trim()),
      };

      await dispatch(createProduct(payload)).unwrap();
      setLoading(false);
      setSuccessMsg('Wholesale product published successfully to catalog!');
      setTimeout(() => {
        navigate('/supplier');
      }, 1500);
    } catch (err) {
      setLoading(false);
      setErrorMsg(typeof err === 'string' ? err : 'Failed to publish product');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-4 border-b border-slate-200">
          <Link
            to="/supplier"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Supplier Hub</span>
          </Link>
          <div className="flex items-center space-x-2">
            <PackagePlus className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">
              B2B Wholesale Product Builder
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure MOQ, tiered wholesale rate slabs, technical specifications, and factory dispatch parameters
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. General Identification */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              1. Basic Product Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Commercial Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Heavy Duty Rotary Concrete Hammer (1200W)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manufacturer SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g. APX-ROT-1200W"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand / Line
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trading Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="pieces">Pieces</option>
                  <option value="boxes">Boxes</option>
                  <option value="cartons">Cartons</option>
                  <option value="sets">Sets</option>
                  <option value="kg">Kilograms</option>
                  <option value="meters">Meters</option>
                  <option value="units">Units</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Commercial & Technical Description
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detail industrial specifications, build quality, power ratings, application use cases..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Tiered Pricing Manager (Key B2B Wholesale Requirement) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Volume Tiered Pricing Matrix
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Buyers receive automatic price reductions based on order volume
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addTier}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier Slab</span>
              </button>
            </div>

            <div className="space-y-3">
              {tieredPricing.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <span className="text-xs font-black text-slate-500 shrink-0 w-16">
                    Tier {idx + 1}:
                  </span>

                  <div className="flex items-center space-x-2 flex-1 w-full sm:w-auto">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Min Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={tier.minQuantity}
                        onChange={(e) => handleTierChange(idx, 'minQuantity', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                        required
                      />
                    </div>

                    <span className="text-slate-400 text-xs mt-3">to</span>

                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Max Qty (Blank = +)</label>
                      <input
                        type="number"
                        placeholder="Unlimited"
                        value={tier.maxQuantity || ''}
                        onChange={(e) => handleTierChange(idx, 'maxQuantity', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-44">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Price / Unit (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={tier.pricePerUnit}
                      onChange={(e) => handleTierChange(idx, 'pricePerUnit', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-black text-blue-700"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTier(idx)}
                    disabled={tieredPricing.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Inventory & Logistics Parameters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              3. Inventory, Tax & Dispatch Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Order (MOQ)
                </label>
                <input
                  type="number"
                  min={1}
                  name="moq"
                  value={formData.moq}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Factory Stock Available
                </label>
                <input
                  type="number"
                  min={0}
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HSN / Commodity Code
                </label>
                <input
                  type="text"
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispatch Lead Time (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  name="leadTimeDays"
                  value={formData.leadTimeDays}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* 4. Specifications Key-Value List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  4. Technical Specifications
                </h3>
              </div>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            <div className="space-y-2">
              {specifications.map((spec, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Key (e.g. Impact Energy)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 4.5 Joules SDS-Plus)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Link
              to="/supplier"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {loading ? 'Publishing Product...' : 'Publish Wholesale Product to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductBuilderPage;
