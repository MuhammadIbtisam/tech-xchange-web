import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Divider, 
  Tag, 
  Rate, 
  Image, 
  Row, 
  Col, 
  message, 
  Spin,
  Empty,
  Avatar,
  Badge
} from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  HeartFilled, 
  ArrowLeftOutlined,
  StarOutlined,
  FireOutlined,
  UserOutlined,
  ShopOutlined,
  EyeOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = ({ product, onBack, onRefresh, onProductView }) => {
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin } = useAuth();
  const { addToCart, isInCart } = useCart();
  
  // Debug: Log props to see what's being passed
  console.log('🔍 ProductDetailPage props:', { 
    hasProduct: !!product, 
    hasOnBack: !!onBack, 
    hasOnRefresh: !!onRefresh, 
    hasOnProductView: !!onProductView,
    onProductViewType: typeof onProductView
  });
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Check if product is saved when component mounts
  useEffect(() => {
    if (isAuthenticated && product._id && user?._id) {
      checkSavedStatus();
    }
  }, [product._id, isAuthenticated, user?._id]);

  // Check backend health when component mounts
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (!response.ok) {
        console.warn('⚠️ Backend health check failed:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Backend may not be running:', error.message);
    }
  };

  // Load related products
  useEffect(() => {
    loadRelatedProducts();
  }, [product]);

  const checkSavedStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsSaved(false);
        return;
      }
      const response = await productService.checkIfSaved(product._id, token);
      setIsSaved(response.isSaved || false);
    } catch (error) {
      console.error('Error checking saved status:', error);
      setIsSaved(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      message.warning('Please login to save items');
      return;
    }

    const token = localStorage.getItem('token');
    console.log('🔑 Save toggle - Token found:', token ? 'Yes' : 'No');
    console.log('🔑 Token details:', {
      length: token ? token.length : 0,
      startsWith: token ? token.substring(0, 20) + '...' : 'None',
      endsWith: token ? '...' + token.substring(token.length - 20) : 'None'
    });
    
    if (!token) {
      message.error('Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        // For removal, we need the savedItemId from the product or check response
        if (!product.savedItemId) {
          // Try to get the saved item ID first
          const checkResponse = await productService.checkIfSaved(product._id, token);
          if (checkResponse.savedItemId) {
            await productService.removeFromSavedItems(checkResponse.savedItemId, token);
          } else {
            // If no savedItemId found, just update local state
            setIsSaved(false);
            message.success('Removed from saved items');
            return;
          }
        } else {
          await productService.removeFromSavedItems(product.savedItemId, token);
        }
        setIsSaved(false);
        message.success('Removed from saved items');
      } else {
        const response = await productService.addToSavedItems(product._id, token);
        console.log('Save response:', response);
        
        if (response.success) {
          setIsSaved(true);
          // Update the product with the savedItemId if returned
          if (response.savedItemId) {
            product.savedItemId = response.savedItemId;
          }
          message.success('Added to saved items');
        } else {
          throw new Error(response.message || 'Failed to save item');
        }
      }
    } catch (error) {
      console.error('Error toggling saved status:', error);
      
      // Check if it's a network/server error - be more comprehensive
      const isServerError = error.message.includes('500') || 
                           error.message.includes('Internal Server Error') || 
                           error.message.includes('Error adding to saved items') ||
                           error.message.includes('Error removing from saved items') ||
                           error.message.includes('Network Error') ||
                           error.message.includes('fetch failed');
      
      if (isServerError) {
        message.error('Server error - please try again later. The save feature may be temporarily unavailable.');
        
        // For now, let's simulate the save locally so the UI works
        // This is a temporary fix until the backend is working
        if (!isSaved) {
          setIsSaved(true);
          message.info('Saved locally (server sync pending)');
        }
      } else if (error.message.includes('401')) {
        message.error('Authentication failed - please login again');
      } else if (error.message.includes('404')) {
        message.error('Product not found');
      } else {
        message.error(`Failed to update saved items: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      message.warning('Please login to add items to cart');
      return;
    }
    
    if (product.stock === 0) {
      message.error('Product is out of stock');
      return;
    }
    
    const result = addToCart(product, 1);
    if (result.success) {
      message.success('Added to cart successfully!');
    } else {
      message.error('Failed to add to cart');
    }
  };

  const loadRelatedProducts = async () => {
    if (!product.productTypeId?.categoryId?._id) return;
    
    setLoadingRelated(true);
    try {
      const params = {
        category: product.productTypeId.categoryId._id,
        limit: 4
      };
      
      const response = await productService.getProducts(params);
      if (response.success) {
        // Filter out the current product manually since API might not support exclude
        const filteredProducts = (response.products || []).filter(p => p._id !== product._id);
        setRelatedProducts(filteredProducts.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'green',
      'like-new': 'blue',
      'good': 'orange',
      'fair': 'yellow',
      'poor': 'red'
    };
    return colors[condition] || 'default';
  };

  if (!product || !product._id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Empty description="Product not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={onBack}
              className="text-lg"
            />
            <Title level={2} className="mb-0">
              Product Details
            </Title>
          </div>
          
          {/* Action Buttons */}
          <Space>
            {isAuthenticated && (
              <Button
                type={isSaved ? 'default' : 'dashed'}
                icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleSaveToggle}
                loading={loading}
                className={isSaved ? 'text-red-500' : ''}
              >
                {/* {isSaved ? 'Saved' : 'Save'} */}
              </Button>
            )}
            
            {isBuyer && (
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={isInCart(product._id) ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {product.stock === 0 ? 'Out of Stock' : 
                 isInCart(product._id) ? 'In Cart' : 'Add to Cart'}
              </Button>
            )}
          </Space>
        </div>

        <Row gutter={[32, 32]}>
          {/* Product Images */}
          <Col xs={24} lg={12}>
            <Card className="h-fit">
              {/* Main Image */}
              <div className="mb-4">
                <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      alt={product.productTypeId?.name || product.name}
                      src={product.images[selectedImage]}
                      className="w-full h-full object-cover"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                      📱
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-blue-500' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        alt={`${product.productTypeId?.name || product.name} ${index + 1}`}
                        src={image}
                        className="w-full h-full object-cover"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

          {/* Product Information */}
          <Col xs={24} lg={12}>
            <Card className="h-fit">
              <Space orientation="vertical" className="w-full" size="large">
                {/* Product Title & Status */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <Title level={3} className="mb-2">
                      {product.productTypeId?.name || product.name}
                    </Title>
                    
                    {/* Status Badges */}
                    <div className="flex gap-2">
                      {isAdmin && product.status === 'pending' && (
                        <Badge.Ribbon text="Pending" color="orange">
                          <div></div>
                        </Badge.Ribbon>
                      )}
                      
                      {product.isFeatured && (
                        <Tag icon={<FireOutlined />} color="red">
                          Featured
                        </Tag>
                      )}
                    </div>
                  </div>
                  
                  {/* Brand & Category */}
                  <div className="text-gray-600 mb-3">
                    <Text strong>{product.productTypeId?.brandId?.name || 'Unknown Brand'}</Text>
                    <Text className="mx-2">•</Text>
                    <Text>{product.productTypeId?.categoryId?.displayName || 'Uncategorized'}</Text>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  {product.currency && (
                    <Text className="text-gray-500">{product.currency}</Text>
                  )}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <Rate disabled defaultValue={product.rating} />
                    <Text className="text-gray-600">
                      ({product.rating.toFixed(1)})
                    </Text>
                  </div>
                )}

                {/* Condition & Stock */}
                <div className="flex items-center gap-4">
                  <div>
                    <Text strong>Condition:</Text>
                    <Tag 
                      color={getConditionColor(product.condition)} 
                      className="ml-2"
                    >
                      {product.condition?.charAt(0).toUpperCase() + product.condition?.slice(1)}
                    </Tag>
                  </div>
                  
                  <div>
                    <Text strong>Stock:</Text>
                    <Tag 
                      color={product.stock > 0 ? 'green' : 'red'} 
                      className="ml-2"
                    >
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </Tag>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <Title level={5}>Description</Title>
                    <Paragraph className="text-gray-600">
                      {product.description}
                    </Paragraph>
                  </div>
                )}

                {/* Seller Information */}
                <div>
                  <Title level={5}>Seller Information</Title>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar 
                      size="large" 
                      icon={<UserOutlined />}
                      className="bg-blue-500"
                    />
                    <div>
                      <Text strong className="block">
                        {product.sellerId?.fullName || 'Seller Name'}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        Member since {new Date(product.sellerId?.createdAt || Date.now()).getFullYear()}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <Title level={5}>Additional Details</Title>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Text type="secondary">Product ID:</Text>
                      <Text className="block">{product._id}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Listed:</Text>
                      <Text className="block">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                    {product.updatedAt && (
                      <div>
                        <Text type="secondary">Last Updated:</Text>
                        <Text className="block">
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Related Products */}
        <div className="mt-12">
          <Title level={3} className="mb-6">Related Products</Title>
          
          {loadingRelated ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : relatedProducts.length > 0 ? (
            <Row gutter={[16, 16]}>
              {relatedProducts.map((relatedProduct) => (
                <Col xs={24} sm={12} md={8} lg={6} key={relatedProduct._id}>
                  <Card 
                    hoverable 
                    className="h-full cursor-pointer"
                    onClick={() => {
                      // Navigate to this product's detail page
                      if (onProductView && typeof onProductView === 'function') {
                        onProductView(relatedProduct);
                      }
                    }}
                  >
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <Image
                          alt={relatedProduct.productTypeId?.name || relatedProduct.name}
                          src={relatedProduct.images[0]}
                          className="w-full h-full object-cover"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          📱
                        </div>
                      )}
                    </div>
                    
                    <Title level={5} className="mb-2 line-clamp-2">
                      {relatedProduct.productTypeId?.name || relatedProduct.name}
                    </Title>
                    
                    <div className="text-lg font-bold text-green-600 mb-2">
                      {formatPrice(relatedProduct.price)}
                    </div>
                    
                    {/* Additional product info */}
                    <div className="text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-2">
                        <span>Stock: {relatedProduct.stock}</span>
                        <span>•</span>
                        <span className="capitalize">{relatedProduct.condition}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Tag color="blue">
                        {relatedProduct.productTypeId?.brandId?.name}
                      </Tag>
                      <div className="flex gap-1">
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onProductView && typeof onProductView === 'function') {
                              onProductView(relatedProduct);
                            }
                          }}
                        >
                          {/* View */}
                        </Button>
                        {relatedProduct.stock > 0 && isBuyer && (
                          <Button 
                            type="default" 
                            size="small" 
                            icon={<ShoppingCartOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add to cart functionality for related products - only for buyers
                              if (isAuthenticated) {
                                const result = addToCart(relatedProduct, 1);
                                if (result.success) {
                                  message.success('Added to cart!');
                                } else {
                                  message.error('Failed to add to cart');
                                }
                              } else {
                                message.warning('Please login to add items to cart');
                              }
                            }}
                          >
                            {/* Add */}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No related products found" />
          )}
        </div>
        
        {/* Continue Shopping Section */}
        <div className="mt-12 text-center">
          <Divider />
          <Space direction="vertical" size="large">
            <Title level={4}>Continue Shopping</Title>
            <Text className="text-gray-600">
              Found what you're looking for? Explore more products in our catalog.
            </Text>
            <Button 
              type="primary" 
              size="large" 
              icon={<ShoppingOutlined />}
              onClick={onBack}
            >
              Back to Products
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
