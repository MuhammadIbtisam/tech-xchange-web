import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Select, 
  Space, 
  Typography, 
  Rate, 
  Progress, 
  Empty, 
  Spin, 
  message,
  Row,
  Col,
  Tag,
  Divider
} from 'antd';
import { 
  StarOutlined, 
  FilterOutlined, 
  SortAscendingOutlined,
  MessageOutlined,
  LikeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProductReviews = ({ 
  productId, 
  productName, 
  onReviewSubmit,
  showReviewForm = true,
  compact = false 
}) => {
  const { isAuthenticated, isBuyer } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Product review stats
  const [productStats, setProductStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  });

  // Load reviews when component mounts or filters change
  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId, currentPage, pageSize, selectedRating, sortBy]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        rating: selectedRating || undefined,
        sort: sortBy
      };

      const response = await reviewService.getProductReviews(productId, params);
      
      if (response.success) {
        setReviews(response.data.reviews || []);
        setTotalReviews(response.data.pagination?.totalReviews || 0);
        
        // Update product stats
        if (response.data.product) {
          setProductStats({
            averageRating: response.data.product.averageRating || 0,
            totalReviews: response.data.product.totalReviews || 0,
            ratingDistribution: response.data.product.ratingDistribution || {}
          });
        }
      } else {
        throw new Error(response.message || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      message.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = (reviewData) => {
    // Reload reviews to show the new one
    loadReviews();
    
    // Call parent callback if provided
    if (onReviewSubmit) {
      onReviewSubmit(reviewData);
    }
    
    setShowReviewModal(false);
    setEditingReview(null);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = (reviewId) => {
    // Remove from local state immediately for better UX
    setReviews(prev => prev.filter(review => review._id !== reviewId));
    setTotalReviews(prev => prev - 1);
    
    // Reload to get updated stats
    loadReviews();
  };

  const handleHelpfulToggle = (reviewId, helpfulData) => {
    // Update local state for immediate feedback
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { 
            ...review, 
            helpful: helpfulData.isHelpful 
              ? [...(review.helpful || []), { userId: helpfulData.userId }]
              : (review.helpful || []).filter(h => h.userId !== helpfulData.userId)
          }
        : review
    ));
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'rating') {
      setSelectedRating(value);
    } else if (filterType === 'sort') {
      setSortBy(value);
    }
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSelectedRating('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const getRatingDistribution = () => {
    const distribution = productStats.ratingDistribution;
    const total = productStats.totalReviews;
    
    if (total === 0) return [];
    
    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: distribution[rating] || 0,
      percentage: total > 0 ? Math.round((distribution[rating] || 0) / total * 100) : 0
    }));
  };

  const renderRatingDistribution = () => {
    if (productStats.totalReviews === 0) return null;

    return (
      <div className="space-y-2">
        {getRatingDistribution().map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 w-8">
              <Text className="text-xs">{rating}</Text>
              <StarOutlined className="text-yellow-500 text-xs" />
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              showInfo={false}
              strokeColor="#faad14"
              className="flex-1"
            />
            <Text className="text-xs text-gray-500 w-8 text-right">
              {count}
            </Text>
          </div>
        ))}
      </div>
    );
  };

  const renderReviewForm = () => {
    if (!showReviewForm || !isAuthenticated || !isBuyer) return null;

    return (
      <div className="mb-6">
        <Button
          type="primary"
          icon={<MessageOutlined />}
          onClick={() => setShowReviewModal(true)}
          className="w-full sm:w-auto"
        >
          Write a Review
        </Button>
      </div>
    );
  };

  const renderFilters = () => {
    if (compact) return null;

    return (
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Select
            placeholder="Filter by rating"
            value={selectedRating}
            onChange={(value) => handleFilterChange('rating', value)}
            className="w-full sm:w-40"
            allowClear
          >
            <Option value="5">5 Stars</Option>
            <Option value="4">4 Stars</Option>
            <Option value="3">3 Stars</Option>
            <Option value="2">2 Stars</Option>
            <Option value="1">1 Star</Option>
          </Select>
          
          <Select
            placeholder="Sort by"
            value={sortBy}
            onChange={(value) => handleFilterChange('sort', value)}
            className="w-full sm:w-40"
          >
            <Option value="newest">Newest First</Option>
            <Option value="oldest">Oldest First</Option>
            <Option value="rating">Highest Rating</Option>
            <Option value="helpful">Most Helpful</Option>
          </Select>
        </div>
        
        {(selectedRating || sortBy !== 'newest') && (
          <Button onClick={clearFilters} size="small">
            Clear Filters
          </Button>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (compact || totalReviews <= pageSize) return null;

    const totalPages = Math.ceil(totalReviews / pageSize);
    
    return (
      <div className="flex justify-center mt-6">
        <Space>
          <Button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            First
          </Button>
          <Button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
          <Button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Last
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <div className="product-reviews">
      {/* Review Form */}
      {renderReviewForm()}

      {/* Review Stats */}
      {!compact && productStats.totalReviews > 0 && (
        <Card className="mb-6">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {productStats.averageRating.toFixed(1)}
                </div>
                <Rate 
                  disabled 
                  value={productStats.averageRating} 
                  className="text-lg mb-2"
                />
                <Text type="secondary">
                  Based on {productStats.totalReviews} review{productStats.totalReviews !== 1 ? 's' : ''}
                </Text>
              </div>
            </Col>
            
            <Col xs={24} md={16}>
              <div>
                <Text strong className="block mb-3">Rating Distribution</Text>
                {renderRatingDistribution()}
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Filters */}
      {renderFilters()}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <Text className="block mt-2">Loading reviews...</Text>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onHelpfulToggle={handleHelpfulToggle}
              showActions={isAuthenticated}
              compact={compact}
            />
          ))
        ) : (
          <Empty
            description="No reviews yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {isAuthenticated && isBuyer && (
              <Button 
                type="primary" 
                onClick={() => setShowReviewModal(true)}
              >
                Be the first to review
              </Button>
            )}
          </Empty>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Review Form Modal */}
      <ReviewForm
        productId={productId}
        productName={productName}
        onSuccess={handleReviewSubmit}
        onCancel={() => setShowReviewModal(false)}
        editReview={editingReview}
        visible={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
      />
    </div>
  );
};

export default ProductReviews;
