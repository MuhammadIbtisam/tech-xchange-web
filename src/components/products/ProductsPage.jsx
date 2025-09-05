import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Pagination, 
  Spin, 
  Empty, 
  message, 
  Row, 
  Col,
  Card,
  Slider,
  Divider,
  Tag,
  Avatar,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  StarOutlined,
  EyeOutlined,
  HeartOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import ProductCard from './ProductCard';
import { processProductsImages } from '../../utils/imageUtils';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const ProductsPage = ({ onProductView }) => {
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin } = useAuth();
  
  // State for products and data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // State for UI
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Debounce timer for search
  const searchTimerRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    // Don't load products on initial render - let loadInitialData handle it
    if (products.length > 0 || !loading) {
      loadProducts();
    }
  }, [currentPage, pageSize, selectedCategory, selectedBrand, sortBy, sortOrder]);

  // Reset applying filters state when products are loaded
  useEffect(() => {
    if (applyingFilters) {
      setApplyingFilters(false);
    }
  }, [products]);

  // Simple search handler
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    setApplyingFilters(true);
    // The filtered products will be handled in the render
  };

  // Client-side filtering function
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by search term (partial match in product name)
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name && product.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    if (priceRange[0] > 0 || priceRange[1] < 10000) {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    return filtered;
  };

  // Get filtered products for display
  const filteredProducts = getFilteredProducts();
  const filteredProductsCount = filteredProducts.length;
  
  // Paginate filtered products
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle page size changes and ensure current page is valid
  useEffect(() => {
    const maxPage = Math.ceil(filteredProductsCount / pageSize);
    console.log(' Pagination state:', { currentPage, pageSize, filteredProductsCount, maxPage });
    
    // If current page exceeds max page, reset to max page
    if (currentPage > maxPage && maxPage > 0) {
      console.log('🔄 Resetting current page from', currentPage, 'to', maxPage);
      setCurrentPage(maxPage);
    }
  }, [pageSize, filteredProductsCount, currentPage]);

  // Debug logging for page and page size changes
  useEffect(() => {
    console.log('🔄 Current page changed to:', currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('📏 Page size changed to:', pageSize);
  }, [pageSize]);

  // Price range change handler
  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
    setCurrentPage(1); // Reset to first page
    setApplyingFilters(true);
    // The filtered products will be handled in the render
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load categories and brands in parallel
      const [categoriesData, brandsData] = await Promise.all([
        productService.getCategories(),
        productService.getBrands()
      ]);
      
      setCategories(categoriesData.categories || []);
      setBrands(brandsData.brands || []);
      
      // Load products
      await loadProducts();
    } catch (error) {
      console.error('Error loading initial data:', error);
      message.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: pageSize,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        sortBy: sortBy || undefined,
        order: sortOrder || undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      console.log(' Loading products with params:', params); // Debug log
      console.log(' Selected Category:', selectedCategory); // Debug log
      console.log(' Selected Brand:', selectedBrand); // Debug log

      const response = await productService.getProducts(params);
      
      console.log(' Products API Response:', response); // Debug log
      
      if (response.success) {
        // Process products to ensure image URLs are properly constructed
        const processedProducts = processProductsImages(response.products || []);
        
        setProducts(processedProducts);
        setTotalProducts(response.pagination?.totalProducts || 0);
        console.log(' Products loaded:', processedProducts.length);
        console.log(' Processed images:', processedProducts.map(p => ({ name: p.name, images: p.images })));
        console.log(' Pagination info:', response.pagination);
      } else {
        message.error(response.message || 'Failed to load products');
      }
    } catch (error) {
      console.error(' Error loading products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedCategory, selectedBrand, sortBy, sortOrder]);

  const handleSearchInput = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filterType, value) => {
    // Don't reset page for search and price range - they have their own debounced effects
    if (filterType !== 'search' && filterType !== 'price') {
      setCurrentPage(1);
    }
    
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'brand':
        setSelectedBrand(value);
        break;
      case 'price':
        setPriceRange(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'sortOrder':
        setSortOrder(value);
        break;
      default:
        break;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
    message.success('Products refreshed successfully');
  };

  const handlePageChange = (page, size) => {
    console.log('🔄 Page change requested:', { page, size, currentPage, pageSize });
    
    if (page && page !== currentPage) {
      console.log('🔄 Setting new page:', page);
      setCurrentPage(page);
    }
    
    if (size && size !== pageSize) {
      console.log('📏 Setting new page size:', size);
      setPageSize(size);
      // Reset to first page when changing page size
      setCurrentPage(1);
    }
  };

  const handleProductEdit = (product) => {
    // TODO: Navigate to edit product page
    message.info('Edit product functionality coming soon!');
  };

  const handleProductDelete = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication token not found');
        return;
      }
      
      await productService.deleteProduct(productId, token);
      message.success('Product deleted successfully');
      await loadProducts(); // Reload products
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange([0, 10000]);
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory) count++;
    if (selectedBrand) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (sortBy !== 'date' || sortOrder !== 'desc') count++;
    return count;
  };

  const handleCategoryClick = (categoryId) => {
    console.log('Category clicked:', categoryId);
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleBrandClick = (brandId) => {
    console.log('Brand clicked:', brandId);
    setSelectedBrand(brandId);
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Top Bar - Search Only */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4">
        <div className="flex items-center justify-center">
          {/* Search Bar */}
          <div className="w-full max-w-md">
            <Search
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearchInput(e.target.value)}
              onSearch={handleSearch}
              className="w-full"
              size="small"
              enterButton="Search"
            />
          </div>
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden lg:block bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 md:py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Title level={1} className="text-white mb-4 text-3xl md:text-4xl lg:text-5xl">
            {isAdmin ? 'Admin Dashboard' : 
             isSeller ? 'My Product Store' : 
             'Discover Amazing Tech Products'}
          </Title>
          <Paragraph className="text-blue-100 text-lg md:text-xl mb-8">
            {isAdmin ? 'Manage all products and approve new listings' :
             isSeller ? 'Manage your product catalog and track sales' :
             'Browse thousands of high-quality technology products from trusted sellers'}
          </Paragraph>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-4">
            <Search
              placeholder="Search for products, brands, or categories..."
              allowClear
              enterButton={
                <Button type="primary" size="large" icon={<SearchOutlined />}>
                  Search
                </Button>
              }
              size="large"
              value={searchTerm}
              onChange={(e) => handleSearchInput(e.target.value)}
              onSearch={handleSearch}
              className="shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Categories Section - Mobile Optimized */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <FireOutlined className="text-white text-xs" />
              </div>
              <h3 className="text-sm lg:text-lg font-semibold text-gray-800">
                Categories
              </h3>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {categories.length}
            </span>
          </div>
          
          {/* Horizontal Scrollable Categories - Mobile Optimized */}
          <div className="relative">
            <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-3 scrollbar-hide">
              {categories.map(category => (
                <div
                  key={category._id}
                  className={`flex-shrink-0 w-14 h-16 lg:w-20 lg:h-20 cursor-pointer transition-all duration-200 group ${
                    selectedCategory === category._id 
                      ? 'scale-105' 
                      : 'hover:scale-102'
                  }`}
                  onClick={() => handleCategoryClick(category._id)}
                >
                  <div className={`w-14 h-14 lg:w-20 lg:h-20 mx-auto mb-1 lg:mb-1.5 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    selectedCategory === category._id 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md ring-1 ring-blue-300' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 border border-gray-200'
                  }`}>
                    <span className="text-base lg:text-xl">
                      {category.icon || '📱'}
                    </span>
                  </div>
                  <div className={`text-center text-xs font-medium truncate px-0.5 ${
                    selectedCategory === category._id 
                      ? 'text-blue-600' 
                      : 'text-gray-600'
                  }`}>
                    {category.displayName || category.name}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll Indicators */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-8 lg:w-8 lg:h-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-8 lg:w-8 lg:h-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Brands Section - Mobile Optimized */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <StarOutlined className="text-white text-xs" />
              </div>
              <h3 className="text-sm lg:text-lg font-semibold text-gray-800">
                Brands
              </h3>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {brands.length}
            </span>
          </div>
          
          {/* Horizontal Scrollable Brands - Mobile Optimized */}
          <div className="relative">
            <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-3 scrollbar-hide">
              {brands.map(brand => (
                <div
                  key={brand._id}
                  className={`flex-shrink-0 w-16 sm:w-20 cursor-pointer transition-all duration-200 group ${
                    selectedBrand === brand._id 
                      ? 'scale-105' 
                      : 'hover:scale-102'
                  }`}
                  onClick={() => handleBrandClick(brand._id)}
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-1.5 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    selectedBrand === brand._id 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-md ring-1 ring-green-300' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-green-50 group-hover:to-emerald-50 border border-gray-200'
                  }`}>
                    {brand.logo ? (
                      <img 
                        src={brand.logo} 
                        alt={brand.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span 
                      className={`text-lg sm:text-xl font-bold ${
                        brand.logo ? 'hidden' : 'block'
                      }`}
                    >
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                  <div className={`text-center text-xs font-medium truncate px-0.5 ${
                    selectedBrand === brand._id 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}>
                    {brand.name}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll Indicators */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Compact Filter Section */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Filter Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FilterOutlined className="text-white text-xs" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Filters & Sorting</h3>
                <p className="text-xs text-gray-500">
                  {getFilterCount() > 0 ? `${getFilterCount()} active filters` : 'No filters applied'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                {filteredProductsCount} products
              </span>
              <Button 
                type="text" 
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600 hover:text-blue-700"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Tags */}
          {(selectedCategory || selectedBrand || searchTerm || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-blue-600 font-medium">Active:</span>
                  {selectedCategory && (
                    <Tag 
                      color="blue" 
                      closable 
                      onClose={() => setSelectedCategory('')} 
                      className="text-xs border-blue-200 bg-blue-100 text-blue-700"
                    >
                      {categories.find(c => c._id === selectedCategory)?.displayName}
                    </Tag>
                  )}
                  {selectedBrand && (
                    <Tag 
                      color="green" 
                      closable 
                      onClose={() => setSelectedBrand('')} 
                      className="text-xs border-green-200 bg-green-100 text-green-700"
                    >
                      {brands.find(b => b._id === selectedBrand)?.name}
                    </Tag>
                  )}
                  {searchTerm && (
                    <Tag 
                      color="orange" 
                      closable 
                      onClose={() => setSearchTerm('')} 
                      className="text-xs border-orange-200 bg-orange-100 text-orange-700"
                    >
                      "{searchTerm}"
                    </Tag>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <Tag 
                      color="purple" 
                      closable 
                      onClose={() => setPriceRange([0, 10000])} 
                      className="text-xs border-purple-200 bg-purple-100 text-purple-700"
                    >
                      ${priceRange[0]} - ${priceRange[1]}
                    </Tag>
                  )}
                </div>
                <Button 
                  type="link" 
                  size="small" 
                  onClick={clearFilters} 
                  className="text-blue-600 text-xs hover:text-blue-700"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Filter Options */}
          {showFilters && (
            <div className="p-4 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Price Range</label>
                  <Slider
                    range
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    tipFormatter={(value) => `$${value}`}
                    className="w-full"
                    size="small"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Sort By</label>
                  <Select
                    value={sortBy}
                    onChange={(value) => handleFilterChange('sortBy', value)}
                    className="w-full"
                    size="small"
                    placeholder="Sort by..."
                  >
                    <Option value="date">Date</Option>
                    <Option value="price">Price</Option>
                    <Option value="rating">Rating</Option>
                    <Option value="name">Name</Option>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Order</label>
                  <Select
                    value={sortOrder}
                    onChange={(value) => handleFilterChange('sortOrder', value)}
                    className="w-full"
                    size="small"
                    placeholder="Order..."
                  >
                    <Option value="desc">Descending</Option>
                    <Option value="asc">Ascending</Option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex gap-2">
              
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
                size="small"
                className="text-xs"
              >
                Refresh
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Interactive Products Section */}
        {products.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Title level={3} className="text-gray-700 text-lg sm:text-xl md:text-2xl mb-0">
                  {selectedCategory ? 
                    `Products in ${categories.find(c => c._id === selectedCategory)?.displayName}` :
                    selectedBrand ? 
                    `Products from ${brands.find(b => b._id === selectedBrand)?.name}` :
                    'All Products'
                  }
                </Title>
                {applyingFilters && (
                  <Spin size="small" />
                )}
              </div>
              {applyingFilters && (
                <Text className="text-blue-600 text-sm">
                  Applying filters...
                </Text>
              )}
            </div>
            
            {/* Products Grid/List - Mobile Optimized */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                {paginatedProducts.map(product => (
                  <div key={product._id} className="group">
                    <ProductCard
                      product={product}
                      onEdit={handleProductEdit}
                      onDelete={handleProductDelete}
                      onRefresh={loadProducts}
                      onProductView={onProductView}
                      viewMode="grid"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedProducts.map(product => (
                  <div key={product._id} className="group">
                    <ProductCard
                      product={product}
                      onEdit={handleProductEdit}
                      onDelete={handleProductDelete}
                      onRefresh={loadProducts}
                      onProductView={onProductView}
                      viewMode="list"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Pagination - Always Show */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Products per page:
                  </span>
                  <Select
                    value={pageSize}
                    onChange={(value) => {
                      console.log('📏 Page size changed to:', value);
                      handlePageChange(undefined, value);
                    }}
                    size="small"
                    className="w-20"
                  >
                    <Option value={12}>12</Option>
                    <Option value={24}>24</Option>
                    <Option value={48}>48</Option>
                    <Option value={96}>96</Option>
                    {filteredProductsCount > 96 && (
                      <Option value={filteredProductsCount}>{filteredProductsCount} (All)</Option>
                    )}
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Show current page info */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-sm text-gray-600">
                      {pageSize >= filteredProductsCount ? (
                        `Showing all ${filteredProductsCount} products`
                      ) : (
                        `Page ${currentPage} of ${Math.ceil(filteredProductsCount / pageSize)}`
                      )}
                    </span>
                    {pageSize < filteredProductsCount && (
                      <span className="text-xs text-gray-500">
                        {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredProductsCount)} of {filteredProductsCount}
                      </span>
                    )}
                    {/* Show pagination status */}
                    {pageSize < filteredProductsCount && (
                      <span className="text-xs text-blue-600">
                        {currentPage * pageSize > filteredProductsCount ? 'Last page' : 'More pages available'}
                      </span>
                    )}
                  </div>
                  
                  {/* Simple Pagination */}
                  {Math.ceil(filteredProductsCount / pageSize) > 1 ? (
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <Button
                        size="small"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="text-xs"
                      >
                        Previous
                      </Button>
                      
                      {/* Page Info */}
                      <span className="text-xs text-gray-600 px-2">
                        Page {currentPage} of {Math.ceil(filteredProductsCount / pageSize)}
                      </span>
                      
                      {/* Next Button */}
                      <Button
                        size="small"
                        disabled={currentPage >= Math.ceil(filteredProductsCount / pageSize)}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="text-xs"
                      >
                        Next
                      </Button>
                      
                      {/* Quick Jumper */}
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-gray-500">Go to:</span>
                        <Input
                          size="small"
                          className="w-16 text-xs"
                          placeholder="Page"
                          onPressEnter={(e) => {
                            const page = parseInt(e.target.value);
                            if (page && page >= 1 && page <= Math.ceil(filteredProductsCount / pageSize)) {
                              handlePageChange(page);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {pageSize >= filteredProductsCount ? 'All products visible' : 'Single page'}
                    </span>
                  )}
                  
                  {/* Debug info and messages */}
                  <div className="flex flex-col gap-1">
                    {/* Show message when page size > total products */}
                    {pageSize > filteredProductsCount && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                        All products visible
                      </span>
                    )}
                    
                    {/* Debug info */}
                    <div className="text-xs text-gray-500">
                      Debug: Page {currentPage}, Size {pageSize}, Total {filteredProductsCount}, MaxPage {Math.ceil(filteredProductsCount / pageSize)}
                    </div>
                    

                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Empty
            description={
              <div className="text-center">
                <Title level={3} className="text-gray-700 text-lg sm:text-xl">No products found</Title>
                <Text className="text-gray-500 text-base sm:text-lg">
                  Try adjusting your search or filters
                </Text>
                <div className="mt-4">
                  <Button type="primary" onClick={clearFilters} size="small">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            }
            className="py-12 sm:py-16"
          />
        )}


      </div>
    </div>
  );
};

export default ProductsPage;
