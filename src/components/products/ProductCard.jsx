import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Rate, Space, Typography, Image, message, Badge } from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  HeartFilled, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';

const { Title, Text, Paragraph } = Typography;

const ProductCard = ({ product, onEdit, onDelete, onRefresh, viewMode = 'grid' }) => {
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if product is saved when component mounts
  useEffect(() => {
    if (isAuthenticated && product._id && user?._id) {
      checkSavedStatus();
    } else {
      // Reset saved status when not authenticated
      setIsSaved(false);
    }
  }, [product._id, isAuthenticated, user?._id]);

  const checkSavedStatus = async () => {
    // Only check if user is authenticated
    if (!isAuthenticated || !user?._id) {
      setIsSaved(false);
      return;
    }

    try {
      // Get token from localStorage since it's not exposed in auth context
      const token = localStorage.getItem('token');
      console.log('🔑 Token found:', token ? 'Yes' : 'No', 'User ID:', user?._id);
      
      if (!token) {
        console.warn('No token found for saved status check');
        setIsSaved(false);
        return;
      }

      const response = await productService.checkIfSaved(product._id, token);
      console.log('💾 Saved status response:', response);
      setIsSaved(response.isSaved || false);
    } catch (error) {
      console.error('Error checking saved status:', error);
      // Don't show error to user, just set as not saved
      setIsSaved(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      message.warning('Please login to save items');
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('🔑 Save toggle - Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      message.error('Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        // Remove from saved items
        await productService.removeFromSavedItems(product.savedItemId, token);
        setIsSaved(false);
        message.success('Removed from saved items');
      } else {
        // Add to saved items
        await productService.addToSavedItems(product._id, token);
        setIsSaved(true);
        message.success('Added to saved items');
      }
    } catch (error) {
      console.error('Error toggling saved status:', error);
      message.error('Failed to update saved items');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      message.warning('Please login to purchase products');
      return;
    }
    // TODO: Implement buy now functionality
    message.info('Buy functionality coming soon!');
  };

  const handleViewDetails = () => {
    // TODO: Navigate to product detail page
    message.info('Product detail page coming soon!');
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication token not found');
        return;
      }
      
      await productService.approveProduct(product._id, token);
      message.success('Product approved successfully');
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Error approving product:', error);
      message.error('Failed to approve product');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication token not found');
        return;
      }
      
      await productService.rejectProduct(product._id, token);
      message.success('Product rejected successfully');
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Error rejecting product:', error);
      message.error('Failed to reject product');
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  // Render different layouts based on viewMode
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              <Image
                alt={product.productTypeId?.name || product.name}
                src={product.images[0]}
                className="w-full h-full object-cover rounded-lg"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                📱
              </div>
            )}
            
            {/* Condition Badge */}
            {product.condition && (
              <Tag 
                color={getConditionColor(product.condition)} 
                className="absolute -top-2 -right-2 text-xs border-0 shadow-sm"
              >
                {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
              </Tag>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {product.productTypeId?.name || product.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {product.productTypeId?.brandId?.name} • {product.productTypeId?.categoryId?.displayName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(product.price)}
                </div>
                {product.currency && (
                  <div className="text-xs text-gray-500">{product.currency}</div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              {product.rating && (
                <div className="flex items-center gap-1">
                  <StarOutlined className="text-yellow-500" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className={`flex items-center gap-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Buy Button for Buyers */}
              {isBuyer && (
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<ShoppingCartOutlined />}
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="text-xs"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </Button>
              )}
              
              {/* View Button */}
              <Button 
                type={isBuyer ? 'default' : 'primary'}
                size="small" 
                icon={<EyeOutlined />}
                onClick={handleViewDetails}
                className="text-xs"
              >
                View Details
              </Button>
              
              {/* Save Button */}
              {isAuthenticated && (
                <Button
                  type={isSaved ? 'default' : 'dashed'}
                  size="small"
                  icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleSaveToggle}
                  loading={loading}
                  className={`text-xs ${isSaved ? 'text-red-500' : ''}`}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              )}

              {/* Admin Actions */}
              {isAdmin && product.status === 'pending' && (
                <div className="flex gap-1">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={handleApprove}
                    className="text-xs"
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={handleReject}
                    className="text-xs"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {/* Seller Actions */}
              {isSeller && product.sellerId === user?._id && (
                <div className="flex gap-1">
                  <Button
                    type="default"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit && onEdit(product)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete && onDelete(product._id)}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group h-full">
      {/* Product Image - Mobile Optimized */}
      <div className="relative h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden rounded-t-lg">
        {product.images && product.images.length > 0 ? (
          <Image
            alt={product.productTypeId?.name || product.name}
            src={product.images[0]}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="text-gray-400 text-4xl flex items-center justify-center h-full">
            📱
          </div>
        )}
        
        {/* Status badges */}
        {isAdmin && product.status === 'pending' && (
          <Badge.Ribbon text="Pending" color="orange" className="absolute top-0 left-0">
            <div></div>
          </Badge.Ribbon>
        )}
        
        {product.condition && (
          <Tag 
            color={getConditionColor(product.condition)} 
            className="absolute top-2 right-2 font-semibold border-0 shadow-sm text-xs"
          >
            {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
          </Tag>
        )}

        {/* Featured badge */}
        {product.isFeatured && (
          <div className="absolute top-2 left-2">
            <Tag 
              icon={<FireOutlined />} 
              color="red" 
              className="font-semibold border-0 shadow-sm text-xs"
            >
              Featured
            </Tag>
          </div>
        )}

        {/* Stock indicator */}
        {product.stock !== undefined && (
          <div className="absolute bottom-2 left-2">
            <Tag 
              color={product.stock > 0 ? 'green' : 'red'} 
              className="font-semibold border-0 shadow-sm text-xs"
            >
              {product.stock > 0 ? `${product.stock}` : 'Out'}
            </Tag>
          </div>
        )}
      </div>

      {/* Product Content - Mobile Optimized */}
      <div className="p-2 sm:p-3 lg:p-4 flex-1 flex flex-col">
        {/* Product Info */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base mb-1 line-clamp-2">
            {product.productTypeId?.name || product.name}
          </h4>
          <p className="text-xs text-gray-500 mb-2 truncate">
            {product.productTypeId?.brandId?.name} • {product.productTypeId?.categoryId?.displayName}
          </p>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Rate disabled defaultValue={product.rating} size="small" className="text-xs" />
              <span className="text-xs text-gray-500">({product.rating.toFixed(1)})</span>
            </div>
          )}

          {/* Price - Mobile Optimized */}
          <div className="mb-2 lg:mb-3">
            <div className="text-base sm:text-lg font-bold text-green-600">
              {formatPrice(product.price)}
            </div>
            {product.currency && (
              <div className="text-xs text-gray-500">{product.currency}</div>
            )}
          </div>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex items-center gap-1 sm:gap-2 mt-auto">
          {/* Buy Button for Buyers */}
          {isBuyer && (
            <Button 
              type="primary" 
              size="small" 
              icon={<ShoppingCartOutlined />}
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="text-xs flex-1"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Buy'}
            </Button>
          )}
          
          {/* View Button */}
          <Button 
            type={isBuyer ? 'default' : 'primary'}
            size="small" 
            icon={<EyeOutlined />}
            onClick={handleViewDetails}
            className={`text-xs ${isBuyer ? 'flex-1' : 'flex-1'}`}
          >
            View
          </Button>
          
          {/* Save Button */}
          {isAuthenticated && (
            <Button
              type={isSaved ? 'default' : 'dashed'}
              size="small"
              icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleSaveToggle}
              loading={loading}
              className={`text-xs ${isSaved ? 'text-red-500' : ''}`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          )}
        </div>

        {/* Admin/Seller Actions */}
        {(isAdmin || (isSeller && product.sellerId === user?._id)) && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
            {isAdmin && product.status === 'pending' && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                  className="text-xs flex-1"
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={handleReject}
                  className="text-xs flex-1"
                >
                  Reject
                </Button>
              </>
            )}

            {isSeller && product.sellerId === user?._id && (
              <>
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit && onEdit(product)}
                  className="text-xs flex-1"
                >
                  Edit
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete && onDelete(product._id)}
                  className="text-xs flex-1"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
