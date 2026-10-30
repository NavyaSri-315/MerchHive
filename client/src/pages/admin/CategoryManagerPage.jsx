import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import API from '../../api/axios';

const CategoryManagerPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Box',
    commissionRate: 3.5,
  });
  const [statusMsg, setStatusMsg] = useState('');

  const loadCategories = async () => {
    try {
      const res = await API.get('/admin/categories');
      setCategories(res.data.categories || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/categories', formData);
      setShowAddForm(false);
      setFormData({ name: '', description: '', icon: 'Box', commissionRate: 3.5 });
      setStatusMsg('Category added successfully');
      loadCategories();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Admin Analytics</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Layers className="w-6 h-6 text-purple-700" />
              <h1 className="text-2xl font-black text-slate-900">
                Marketplace Category & Commission Manager
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure wholesale industry categories, metadata, and platform commission % per category
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
            {statusMsg}
          </div>
        )}

        {/* Add Category Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCategory}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in"
          >
            <h3 className="text-sm font-bold text-slate-900">Define New Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chemicals & Polymers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Icon Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shield / Cpu / Package"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="Industrial grade commodities, raw inputs and finished goods"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Save Category
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                    <Percent className="w-3 h-3" />
                    <span>{cat.commissionRate}% Commission</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.description || 'General industrial category'}</p>
                <span className="text-[10px] text-slate-400 font-mono block mt-2">
                  Slug: {cat.slug}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-xs text-red-500 hover:text-red-700 p-1 flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerPage;
