import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Scale,
  ArrowRight,
  TrendingDown,
  Building,
  CheckCircle,
  PackageOpen,
  X,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag
} from 'lucide-react';
import {
  fetchProducts,
  fetchCategories,
  setSelectedCategory,
  setSearchQuery,
  addToCompare,
} from '../store/slices/productSlice';

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80';

const CatalogPage = () => {
  const dispatch = useDispatch();
  const {
    items: products,
    categories,
    selectedCategory,
    searchQuery,
    compareList,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.products);

  const [minMoq, setMinMoq] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, minMoq, sortBy]);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 12,
    };
    if (selectedCategory) params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    if (minMoq) params.maxMoq = minMoq;
    if (sortBy) params.sort = sortBy;

    dispatch(fetchProducts(params));
  }, [dispatch, selectedCategory, searchQuery, minMoq, sortBy, currentPage]);

  const handleCategoryClick = (slug) => {
    dispatch(setSelectedCategory(slug === selectedCategory ? '' : slug));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleClearAllFilters = () => {
    dispatch(setSelectedCategory(''));
    dispatch(setSearchQuery(''));
    setMinMoq('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(selectedCategory || searchQuery || minMoq || sortBy !== 'newest');

  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Banner with Tagline */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        {/* Decorative background glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Verified badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/15 text-blue-300 border border-blue-400/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Verified Wholesale Network</span>
            </div>

            {/* Brand Title & Tagline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
              Merch<span className="text-blue-400">Hive</span> B2B Marketplace
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-6">
              "Connecting Verified Suppliers with Businesses for Seamless Bulk Trading."
            </p>

            {/* Global Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20 max-w-2xl gap-1.5 sm:gap-0 focus-within:ring-2 focus-within:ring-blue-400 transition-all"
            >
              <div className="flex items-center flex-1 px-3 py-1.5 sm:py-0 min-w-0">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, machinery, electronics, SKUs or brands..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full text-slate-900 text-sm focus:outline-hidden py-1.5 bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => dispatch(setSearchQuery(''))}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4 sm:hidden" />
                <span>Search Catalog</span>
              </button>
            </form>

            {/* Value Highlights */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-5 text-xs text-slate-300/90 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tiered Volume Pricing</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live RFQ Negotiation</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>GST Tax Invoicing</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Category Pills & Filters Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          {/* Categories Pill list with horizontal scroll */}
          <div className="flex-1 min-w-0 flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2 lg:pb-0">
            <button
              onClick={() => handleCategoryClick('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & MOQ controls */}
          <div className="shrink-0 flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* MOQ filter */}
            <div className="flex-1 sm:flex-initial flex items-center space-x-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs hover:border-slate-300 transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium">MOQ:</span>
              <select
                value={minMoq}
                onChange={(e) => setMinMoq(e.target.value)}
                className="font-bold text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="">Any MOQ</option>
                <option value="25">Under 25 units</option>
                <option value="50">Under 50 units</option>
                <option value="100">Under 100 units</option>
              </select>
            </div>

            {/* Sort filter */}
            <div className="flex-1 sm:flex-initial flex items-center space-x-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs hover:border-slate-300 transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-bold text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Latest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="moq_asc">Lowest MOQ First</option>
                <option value="rating">Top Rated Suppliers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Results Count Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              {loading ? (
                'Loading products...'
              ) : (
                `Showing ${products.length} of ${pagination?.total ?? products.length} wholesale products`
              )}
            </span>

            {/* Active category pill */}
            {selectedCategoryObj && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                <span>Category: {selectedCategoryObj.name}</span>
                <button
                  onClick={() => dispatch(setSelectedCategory(''))}
                  className="hover:text-blue-900 cursor-pointer"
                  title="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Active search query pill */}
            {searchQuery && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                <span>Keyword: "{searchQuery}"</span>
                <button
                  onClick={() => dispatch(setSearchQuery(''))}
                  className="hover:text-blue-900 cursor-pointer"
                  title="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Active MOQ pill */}
            {minMoq && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                <span>MOQ: Under {minMoq}</span>
                <button
                  onClick={() => setMinMoq('')}
                  className="hover:text-blue-900 cursor-pointer"
                  title="Remove MOQ filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Reset All Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-900 font-semibold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Grid / Loading / Empty State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-600 font-semibold">Loading verified wholesale products...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving latest tiered pricing & supplier stocks</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-rose-200 my-6 p-8 shadow-xs">
            <p className="text-rose-600 text-sm font-semibold mb-3">{error}</p>
            <button
              onClick={() => dispatch(fetchProducts({}))}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Retry Loading Catalog
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 my-6 p-8 shadow-xs">
            <PackageOpen className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No wholesale products match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search terms, removing MOQ constraints, or selecting a different category.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Active Filters</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {products.map((product) => {
                const lowestTierPrice =
                  product.tieredPricing && product.tieredPricing.length > 0
                    ? product.tieredPricing[product.tieredPricing.length - 1].pricePerUnit
                    : product.basePrice;

                const isCompared = compareList.some((p) => p._id === product._id);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all duration-200 flex flex-col group h-full"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Verified Company Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center space-x-1 border border-emerald-200/90">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Verified Supplier</span>
                      </div>

                      {/* Compare Button */}
                      <button
                        onClick={() => dispatch(addToCompare(product))}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                          isCompared
                            ? 'bg-blue-600 text-white shadow-blue-500/20'
                            : 'bg-white/95 text-slate-700 hover:bg-white hover:text-blue-600 border border-slate-200/80'
                        }`}
                        title={isCompared ? 'Added to Comparison' : 'Add to Compare'}
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Supplier & SKU row with robust alignment */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 gap-2">
                          <span
                            className="font-semibold text-blue-700 truncate flex-1"
                            title={product.company?.name || 'Verified B2B Supplier'}
                          >
                            {product.company?.name || 'Verified B2B Supplier'}
                          </span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0">
                            SKU: {product.sku}
                          </span>
                        </div>

                        {/* Product Title with fixed 2-line height for aligned cards */}
                        <div className="h-11 mb-2 mt-0.5">
                          <Link
                            to={`/product/${product._id}`}
                            className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug block"
                            title={product.name}
                          >
                            {product.name}
                          </Link>
                        </div>

                        {/* Tiered Price Summary Box with fixed height for row consistency */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[84px] flex flex-col justify-between">
                          <div className="flex items-baseline justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 font-medium block">
                                Wholesale From
                              </span>
                              <span className="text-lg font-black text-slate-900 tracking-tight">
                                ₹{lowestTierPrice?.toLocaleString('en-IN') ?? product.basePrice}
                              </span>
                              <span className="text-xs text-slate-500 font-medium"> / {product.unit || 'unit'}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md inline-block">
                                MOQ: {product.moq} {product.unit || 'unit'}
                              </span>
                            </div>
                          </div>

                          {/* Tier preview count */}
                          <div className="mt-1.5 min-h-[16px] flex items-center">
                            {product.tieredPricing && product.tieredPricing.length > 1 ? (
                              <p className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                                <TrendingDown className="w-3 h-3 shrink-0" />
                                <span>{product.tieredPricing.length} volume price breaks available</span>
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-medium">
                                Fixed bulk wholesale rate
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                          to={`/product/${product._id}`}
                          className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors shadow-xs flex items-center justify-center space-x-1.5 group/btn"
                        >
                          <span>View Tiered Pricing & RFQ</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12 pt-6 border-t border-slate-200">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setCurrentPage(num);
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === num
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CatalogPage;
