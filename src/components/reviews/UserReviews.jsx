import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Rate, 
  Tag, 
  message, 
  Popconfirm,
  Empty,
  Spin,
  Row,
  Col,
  Image
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  StarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import ReviewForm from './ReviewForm';

const { Title, Text, Paragraph } = Typography;

const UserReviews = ({ compact = false }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);

  // Load user reviews
  useEffect(() => {
    if (isAuthenticated) {
      loadUserReviews();
    }
  }, [isAuthenticated, currentPage, pageSize]);

  const loadUserReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page: currentPage,
        limit: pageSize
      };

      const response = await reviewService.getUserReviews(params, token);
      
      if (response.success) {
        setReviews(response.data.reviews || []);
        setTotalReviews(response.data.pagination?.totalReviews || 0);
      } else {
        throw new Error(response.message || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading user reviews:', error);
      message.error('Failed to load your reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await reviewService.deleteReview(reviewId, token);
      
      if (response.success) {
        message.success('Review deleted successfully');
        loadUserReviews(); // Reload reviews
      } else {
        throw new Error(response.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Failed to delete review');
    }
  };

  const handleReviewUpdate = (updatedReview) => {
    // Update local state
    setReviews(prev => prev.map(review => 
      review._id === updatedReview._id ? updatedReview : review
    ));
    
    setShowEditModal(false);
    setEditingReview(null);
    message.success('Review updated successfully');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'orange';
    return 'red';
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good', 
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating] || '';
  };

  // Table columns for desktop view
  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {record.productId?.productTypeId?.images?.[0] ? (
              <Image
                src={record.productId.productTypeId.images[0]}
                alt={record.productId.productTypeId.name}
                className="w-full h-full object-cover"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                📱
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Text strong className="block truncate">
              {record.productId?.productTypeId?.name || 'Unknown Product'}
            </Text>
            <Text type="secondary" className="text-xs">
              {record.productId?.productTypeId?.brandId?.name || 'Unknown Brand'}
            </Text>
          </div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Rating',
      key: 'rating',
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Rate disabled value={record.rating} className="text-sm" />
          <Tag color={getRatingColor(record.rating)} className="text-xs">
            {record.rating}/5 - {getRatingText(record.rating)}
          </Tag>
        </div>
      ),
      width: 120
    },
    {
      title: 'Review',
      key: 'comment',
      render: (_, record) => (
        <Paragraph 
          ellipsis={{ rows: 2, expandable: true }}
          className="mb-0 text-sm"
        >
          {record.comment}
        </Paragraph>
      ),
      width: 300
    },
    {
      title: 'Date',
      key: 'createdAt',
      render: (_, record) => (
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarOutlined />
            {formatDate(record.createdAt)}
          </div>
          {record.updatedAt !== record.createdAt && (
            <div className="text-xs text-blue-500 mt-1">
              Edited
            </div>
          )}
        </div>
      ),
      width: 100
    },
    {
      title: 'Helpful',
      key: 'helpful',
      render: (_, record) => (
        <div className="text-center">
          <div className="text-sm font-medium">
            {record.helpful?.length || 0}
          </div>
          <Text type="secondary" className="text-xs">
            helpful
          </Text>
        </div>
      ),
      width: 80
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditReview(record)}
            className="text-blue-500 hover:text-blue-600"
          />
          <Popconfirm
            title="Delete Review"
            description="Are you sure you want to delete this review? This action cannot be undone."
            onConfirm={() => handleDeleteReview(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              className="text-red-500 hover:text-red-600"
            />
          </Popconfirm>
        </Space>
      ),
      width: 100
    }
  ];

  // Card view for mobile/compact
  const renderCardView = () => {
    if (reviews.length === 0) return null;

    return (
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id} size="small" className="review-card">
            <div className="space-y-3">
              {/* Product Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {review.productId?.productTypeId?.images?.[0] ? (
                    <Image
                      src={review.productId.productTypeId.images[0]}
                      alt={review.productId.productTypeId.name}
                      className="w-full h-full object-cover"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📱
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Text strong className="block truncate">
                    {review.productId?.productTypeId?.name || 'Unknown Product'}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {review.productId?.productTypeId?.brandId?.name || 'Unknown Brand'}
                  </Text>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rate disabled value={review.rating} className="text-sm" />
                  <Tag color={getRatingColor(review.rating)} className="text-xs">
                    {review.rating}/5
                  </Tag>
                </div>
                <Text type="secondary" className="text-xs">
                  {formatDate(review.createdAt)}
                </Text>
              </div>

              {/* Review Text */}
              <Paragraph 
                ellipsis={{ rows: 3, expandable: true }}
                className="mb-0 text-sm"
              >
                {review.comment}
              </Paragraph>

              {/* Helpful Count & Actions */}
              <div className="flex items-center justify-between">
                <Text type="secondary" className="text-xs">
                  {review.helpful?.length || 0} people found this helpful
                </Text>
                <Space size="small">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditReview(review)}
                    className="text-blue-500"
                  />
                  <Popconfirm
                    title="Delete Review"
                    description="Are you sure you want to delete this review?"
                    onConfirm={() => handleDeleteReview(review._id)}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      className="text-red-500"
                    />
                  </Popconfirm>
                </Space>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <Empty
          description="Please login to view your reviews"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div className="user-reviews">
      <div className="mb-4">
        <Title level={4} className="mb-2">
          My Reviews
        </Title>
        <Text type="secondary">
          Manage your product reviews and ratings
        </Text>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <Text className="block mt-2">Loading your reviews...</Text>
        </div>
      ) : reviews.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table
              columns={columns}
              dataSource={reviews}
              rowKey="_id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalReviews,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} reviews`,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }
              }}
              className="reviews-table"
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {renderCardView()}
            
            {/* Mobile Pagination */}
            {totalReviews > pageSize && (
              <div className="flex justify-center mt-4">
                <Space>
                  <Button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    size="small"
                  >
                    First
                  </Button>
                  <Button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    size="small"
                  >
                    Previous
                  </Button>
                  <span className="px-2 py-1 text-sm">
                    {currentPage} / {Math.ceil(totalReviews / pageSize)}
                  </span>
                  <Button 
                    disabled={currentPage === Math.ceil(totalReviews / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    size="small"
                  >
                    Next
                  </Button>
                  <Button 
                    disabled={currentPage === Math.ceil(totalReviews / pageSize)}
                    onClick={() => setCurrentPage(Math.ceil(totalReviews / pageSize))}
                    size="small"
                  >
                    Last
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </>
      ) : (
        <Empty
          description="You haven't written any reviews yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary">
            Start reviewing products you've purchased to help other buyers!
          </Text>
        </Empty>
      )}

      {/* Edit Review Modal */}
      <ReviewForm
        productId={editingReview?.productId?._id}
        productName={editingReview?.productId?.productTypeId?.name}
        onSuccess={handleReviewUpdate}
        onCancel={() => setShowEditModal(false)}
        editReview={editingReview}
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingReview(null);
        }}
      />
    </div>
  );
};

export default UserReviews;
