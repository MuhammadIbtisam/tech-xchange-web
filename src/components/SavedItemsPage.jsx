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
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import ProductCard from './products/ProductCard';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const SavedItemsPage = ({ onProductView }) => {
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin } = useAuth();
  
  // State for products and data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
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

  const loadSavedProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication token not found');
        return;
      }

      console.log('🔄 Loading saved products with params:', { currentPage, pageSize });

      const options = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        minPrice: priceRange[0] > 0 ? priceRange[0] : '',
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : '',
        sortBy: sortBy,
        order: sortOrder
      };

      const response = await productService.getMySavedItems(token, options);
      
      console.log('📥 Saved products API Response:', response);
      
      if (response.success) {
        // Extract products from saved items - Updated to match actual API response
        const savedItems = response.data?.savedItems || response.savedItems || [];
        console.log('🔍 Raw saved items from API:', savedItems);
        console.log('🔍 First saved item structure:', savedItems[0]);
        
        // Since the saved items API doesn't return populated product data,
        // we need to fetch the full product details for each saved item
        console.log('🔄 Fetching full product details for saved items...');
        
        const savedProducts = await Promise.all(
          savedItems.map(async (item) => {
            console.log('🔍 Processing saved item:', item._id);
            console.log('🔍 Product ID to fetch:', item.productId._id);
            
            try {
              // Fetch the full product details
              const productResponse = await productService.getProductById(item.productId._id, token);
              console.log('🔍 Product response:', productResponse);
              
              if (productResponse.success && productResponse.product) {
                const fullProduct = productResponse.product;
                console.log('🔍 Full product data:', fullProduct);
                
                // Create a properly structured product object that matches ProductCard expectations
                const product = {
                  _id: fullProduct._id,
                  name: fullProduct.name || 'Unknown Product',
                  price: fullProduct.price || 0,
                  currency: fullProduct.currency || 'USD',
                  condition: fullProduct.condition || 'unknown',
                  stock: fullProduct.stock || 0,
                  images: fullProduct.images || ['https://via.placeholder.com/300x300?text=No+Image'],
                  rating: fullProduct.rating || 0,
                  isSaved: true,
                  savedItemId: item._id,
                  notes: item.notes || '',
                  dateAdded: item.createdAt,
                  
                  // Structure that ProductCard expects - use full product data
                  productTypeId: {
                    _id: fullProduct.productTypeId?._id || 'unknown',
                    name: fullProduct.productTypeId?.name || fullProduct.name || 'Unknown Product',
                    brandId: {
                      _id: fullProduct.productTypeId?.brandId?._id || 'unknown',
                      name: fullProduct.productTypeId?.brandId?.name || 'Unknown Brand'
                    },
                    categoryId: {
                      _id: fullProduct.productTypeId?.categoryId?._id || 'unknown',
                      displayName: fullProduct.productTypeId?.categoryId?.displayName || 'Unknown Category'
                    }
                  },
                  
                  // Seller information - use full product data
                  sellerId: {
                    _id: fullProduct.sellerId?._id || 'unknown',
                    fullName: fullProduct.sellerId?.fullName || 'Unknown Seller',
                    email: fullProduct.sellerId?.email || ''
                  }
                };
                
                console.log('✅ Mapped product with full data:', product);
                return product;
              } else {
                console.log('⚠️ Failed to fetch product details, using basic data');
                // Fallback to basic data if product fetch fails
                const productData = item.productId;
                return {
                  _id: productData._id,
                  name: `Product ${productData._id.slice(-4)}`, // Use last 4 chars of ID as fallback
                  price: productData.price || 0,
                  currency: productData.currency || 'USD',
                  condition: productData.condition || 'unknown',
                  stock: productData.stock || 0,
                  images: ['https://via.placeholder.com/300x300?text=No+Image'],
                  rating: 0,
                  isSaved: true,
                  savedItemId: item._id,
                  notes: item.notes || '',
                  dateAdded: item.createdAt,
                  productTypeId: {
                    _id: 'unknown',
                    name: `Product ${productData._id.slice(-4)}`,
                    brandId: { _id: 'unknown', name: 'Unknown Brand' },
                    categoryId: { _id: 'unknown', displayName: 'Unknown Category' }
                  },
                  sellerId: {
                    _id: 'unknown',
                    fullName: 'Unknown Seller',
                    email: ''
                  }
                };
              }
            } catch (error) {
              console.error('❌ Error fetching product details:', error);
              // Fallback to basic data
              const productData = item.productId;
              return {
                _id: productData._id,
                name: `Product ${productData._id.slice(-4)}`,
                price: productData.price || 0,
                currency: productData.currency || 'USD',
                condition: productData.condition || 'unknown',
                stock: productData.stock || 0,
                images: ['https://via.placeholder.com/300x300?text=No+Image'],
                rating: 0,
                isSaved: true,
                savedItemId: item._id,
                notes: item.notes || '',
                dateAdded: item.createdAt,
                productTypeId: {
                  _id: 'unknown',
                  name: `Product ${productData._id.slice(-4)}`,
                  brandId: { _id: 'unknown', name: 'Unknown Brand' },
                  categoryId: { _id: 'unknown', displayName: 'Unknown Category' }
                },
                sellerId: {
                  _id: 'unknown',
                  fullName: 'Unknown Seller',
                  email: ''
                }
              };
            }
          })
        );
        
        console.log('📦 Extracted saved products:', savedProducts.length);
        console.log('📦 First extracted product:', savedProducts[0]);
        
        // Apply client-side filtering if needed
        let filteredProducts = savedProducts;
        
        // Apply search filter
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Apply price filter
        if (priceRange[0] > 0 || priceRange[1] < 10000) {
          filteredProducts = filteredProducts.filter(product => 
            product.price >= priceRange[0] && product.price <= priceRange[1]
          );
        }
        
        // Apply sorting
        filteredProducts.sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'price':
              aValue = a.price;
              bValue = b.price;
              break;
            case 'rating':
              aValue = a.rating || 0;
              bValue = b.rating || 0;
              break;
            case 'date':
            default:
              aValue = new Date(a.createdAt || a.dateAdded || Date.now());
              bValue = new Date(b.createdAt || b.dateAdded || Date.now());
              break;
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        console.log('🔍 Final filtered products before setting state:', filteredProducts);
        console.log('🔍 Filtered products length:', filteredProducts.length);
        
        setProducts(filteredProducts);
        // Handle pagination from actual API response
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalProducts(pagination.totalItems || pagination.total || filteredProducts.length);
        console.log('✅ Saved products loaded:', filteredProducts.length);
        console.log('📊 Pagination info:', pagination);
        console.log('🔍 Products state should now contain:', filteredProducts.length, 'items');
      } else {
        // Fallback to mock data if API fails
        console.log('⚠️ API failed, using mock saved products');
        const mockProducts = getMockSavedProducts();
        setProducts(mockProducts);
        setTotalProducts(mockProducts.length);
        message.warning('Using offline data - some features may be limited');
      }
    } catch (error) {
      console.error('❌ Error loading saved products:', error);
      // Use mock data as fallback
      const mockProducts = getMockSavedProducts();
      setProducts(mockProducts);
      setTotalProducts(mockProducts.length);
      message.warning('Using offline data - some features may be limited');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, priceRange, sortBy, sortOrder]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedProducts();
    }
  }, [isAuthenticated, loadSavedProducts]);

  // Refresh when component becomes visible (in case user saved items from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log('🔄 Page became visible, refreshing saved products');
        loadSavedProducts();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        console.log('🔄 Window focused, refreshing saved products');
        loadSavedProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, loadSavedProducts]);

  // Load products when essential filters change (not search or price range)
  useEffect(() => {
    // Don't load products on initial render - let loadSavedProducts handle it
    if (products.length > 0 || !loading) {
      loadSavedProducts();
    }
  }, [currentPage, pageSize, sortBy, sortOrder, loadSavedProducts]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setCurrentPage(1); // Reset to first page
        setApplyingFilters(true);
        loadSavedProducts().finally(() => setApplyingFilters(false));
      }
    }, 500); // 500ms delay

    searchTimerRef.current = timer;

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, loadSavedProducts]);

  // Handle page size changes and ensure current page is valid
  useEffect(() => {
    const maxPage = Math.ceil(totalProducts / pageSize);
    console.log(' Pagination state:', { currentPage, pageSize, totalProducts, maxPage });
    
    // If current page exceeds max page, reset to max page
    if (currentPage > maxPage && maxPage > 0) {
      console.log('🔄 Resetting current page from', currentPage, 'to', maxPage);
      setCurrentPage(maxPage);
    }
  }, [pageSize, totalProducts, currentPage]);

  // Debug logging for page and page size changes
  useEffect(() => {
    console.log('🔄 Current page changed to:', currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('📏 Page size changed to:', pageSize);
  }, [pageSize]);

  // Debounced price range effect
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page
      setApplyingFilters(true);
      loadSavedProducts().finally(() => setApplyingFilters(false));
    }, 800); // 800ms delay for price range

    searchTimerRef.current = timer;

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [priceRange, loadSavedProducts]);

  // Mock data for demonstration
  const getMockSavedProducts = () => [
    {
      _id: 'p1',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1199.99,
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      category: 'Smartphones',
      brand: 'Samsung',
      condition: 'new',
      stock: 5,
      rating: 4.7,
      seller: {
        _id: 's1',
        fullName: 'MobileWorld',
        email: 'contact@mobileworld.com'
      },
      isSaved: true,
      savedItemId: 'saved1'
    },
    {
      _id: 'p2',
      name: 'MacBook Air M2',
      price: 1099.99,
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      category: 'Laptops',
      brand: 'Apple',
      condition: 'new',
      stock: 3,
      rating: 4.9,
      seller: {
        _id: 's2',
        fullName: 'TechStore London',
        email: 'sales@techstore.com'
      },
      isSaved: true,
      savedItemId: 'saved2'
    },
    {
      _id: 'p3',
      name: 'Nike Air Max 270',
      price: 129.99,
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      category: 'Shoes',
      brand: 'Nike',
      condition: 'new',
      stock: 0,
      rating: 4.5,
      seller: {
        _id: 's3',
        fullName: 'SportsDirect',
        email: 'info@sportsdirect.com'
      },
      isSaved: true,
      savedItemId: 'saved3'
    },
    {
      _id: 'p4',
      name: 'Sony WH-1000XM5 Headphones',
      price: 349.99,
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'Audio',
      brand: 'Sony',
      condition: 'new',
      stock: 8,
      rating: 4.8,
      seller: {
        _id: 's4',
        fullName: 'AudioPro UK',
        email: 'support@audiopro.com'
      },
      isSaved: true,
      savedItemId: 'saved4'
    },
    {
      _id: 'p5',
      name: 'Canon EOS R7',
      price: 1899.99,
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
      category: 'Cameras',
      brand: 'Canon',
      condition: 'new',
      stock: 2,
      rating: 4.9,
      seller: {
        _id: 's5',
        fullName: 'CameraWorld',
        email: 'sales@cameraworld.com'
      },
      isSaved: true,
      savedItemId: 'saved5'
    },
    {
      _id: 'p6',
      name: 'Kindle Paperwhite',
      price: 139.99,
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop',
      category: 'Electronics',
      brand: 'Amazon',
      condition: 'new',
      stock: 12,
      rating: 4.6,
      seller: {
        _id: 's6',
        fullName: 'BookStore UK',
        email: 'orders@bookstore.com'
      },
      isSaved: true,
      savedItemId: 'saved6'
    }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Don't call loadSavedProducts here - let the debounced useEffect handle it
  };

  const handleFilterChange = (filterType, value) => {
    // Don't reset page for search and price range - they have their own debounced effects
    if (filterType !== 'search' && filterType !== 'price') {
      setCurrentPage(1);
    }
    
    switch (filterType) {
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
    await loadSavedProducts();
    setRefreshing(false);
    message.success('Saved products refreshed successfully');
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
      await loadSavedProducts(); // Reload products
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 10000]);
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (sortBy !== 'date' || sortOrder !== 'desc') count++;
    return count;
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Empty
          description="Please login to view your saved items"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

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
      <div className="lg:hidden bg-gradient-to-r from-red-600 to-pink-700 text-white py-3 px-4">
        <div className="flex items-center justify-center gap-2">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <Search
              placeholder="Search saved items..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
              size="small"
            />
          </div>
          <Button 
            type="default" 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
            className="text-red-600"
            title="Refresh saved items"
          />
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden lg:block bg-gradient-to-r from-red-600 to-pink-700 text-white py-8 md:py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Title level={1} className="text-white mb-4 text-3xl md:text-4xl lg:text-5xl">
            <HeartOutlined className="mr-3" />
            Your Saved Items
          </Title>
          <Paragraph className="text-red-100 text-lg md:text-xl mb-8">
            Your personal collection of favorite products
          </Paragraph>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex gap-2">
              <Search
                placeholder="Search your saved items..."
                allowClear
                enterButton={
                  <Button type="primary" size="large" icon={<SearchOutlined />}>
                    Search
                  </Button>
                }
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                className="shadow-lg flex-1"
              />
              <Button 
                type="default" 
                size="large" 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
                className="shadow-lg"
                title="Refresh saved items"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Compact Filter Section */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Filter Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <HeartOutlined className="text-white text-xs" />
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
                {totalProducts} saved items
              </span>
              <Button 
                type="text" 
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                className="text-red-600 hover:text-red-700"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Tags */}
          {(searchTerm || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <div className="px-4 py-3 bg-red-50 border-b border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-red-600 font-medium">Active:</span>
                  {searchTerm && (
                    <Tag 
                      color="red" 
                      closable 
                      onClose={() => setSearchTerm('')} 
                      className="text-xs border-red-200 bg-red-100 text-red-700"
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
                      £{priceRange[0]} - £{priceRange[1]}
                    </Tag>
                  )}
                </div>
                <Button 
                  type="link" 
                  size="small" 
                  onClick={clearFilters} 
                  className="text-red-600 text-xs hover:text-red-700"
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
                    onChange={(value) => handleFilterChange('price', value)}
                    tipFormatter={(value) => `£${value}`}
                    className="w-full"
                    size="small"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>£{priceRange[0]}</span>
                    <span>£{priceRange[1]}</span>
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
                    <Option value="date">Date Added</Option>
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
        {console.log('🔍 Render check - products.length:', products.length, 'products:', products)}
        {products.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Title level={3} className="text-gray-700 text-lg sm:text-xl md:text-2xl mb-0">
                  Your Saved Products
                </Title>
                {applyingFilters && (
                  <Spin size="small" />
                )}
              </div>
              {applyingFilters && (
                <Text className="text-red-600 text-sm">
                  Applying filters...
                </Text>
              )}
            </div>
            
            {/* Products Grid/List - Mobile Optimized */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                {products.map(product => (
                  <div key={product._id} className="group">
                    <ProductCard
                      product={product}
                      onEdit={handleProductEdit}
                      onDelete={handleProductDelete}
                      onRefresh={loadSavedProducts}
                      onProductView={onProductView}
                      viewMode="grid"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product._id} className="group">
                    <ProductCard
                      product={product}
                      onEdit={handleProductEdit}
                      onDelete={handleProductDelete}
                      onRefresh={loadSavedProducts}
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
                    Items per page:
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
                    {totalProducts > 96 && (
                      <Option value={totalProducts}>{totalProducts} (All)</Option>
                    )}
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Show current page info */}
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-sm text-gray-600">
                      {pageSize >= totalProducts ? (
                        `Showing all ${totalProducts} saved items`
                      ) : (
                        `Page ${currentPage} of ${Math.ceil(totalProducts / pageSize)}`
                      )}
                    </span>
                    {pageSize < totalProducts && (
                      <span className="text-xs text-gray-500">
                        {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalProducts)} of {totalProducts}
                      </span>
                    )}
                  </div>
                  
                  {/* Simple Pagination */}
                  {Math.ceil(totalProducts / pageSize) > 1 ? (
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
                        Page {currentPage} of {Math.ceil(totalProducts / pageSize)}
                      </span>
                      
                      {/* Next Button */}
                      <Button
                        size="small"
                        disabled={currentPage >= Math.ceil(totalProducts / pageSize)}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {pageSize >= totalProducts ? 'All items visible' : 'Single page'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Empty
            description={
              <div className="text-center">
                <Title level={3} className="text-gray-700 text-lg sm:text-xl">No saved items found</Title>
                <Text className="text-gray-500 text-base sm:text-lg">
                  Start saving products you love by clicking the heart icon
                </Text>
                <div className="mt-4">
                  <Button type="primary" onClick={() => window.location.href = '/products'} size="small">
                    Browse Products
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

export default SavedItemsPage;
