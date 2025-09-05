import React, { useState } from 'react';
import { 
  Card, 
  Avatar, 
  Rate, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Tooltip
} from 'antd';
import { 
  LikeOutlined, 
  LikeFilled, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';

const { Text, Paragraph } = Typography;

const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  onHelpfulToggle,
  showActions = true,
  compact = false 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful?.length || 0);

  // Check if current user has marked this review as helpful
  React.useEffect(() => {
    if (isAuthenticated && user?._id && review.helpful) {
      const userHelpful = review.helpful.some(helpful => helpful.userId === user._id);
      setIsHelpful(userHelpful);
    }
  }, [isAuthenticated, user?._id, review.helpful]);

  const handleHelpfulToggle = async () => {
    if (!isAuthenticated) {
      message.warning('Please login to mark reviews as helpful');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await reviewService.toggleHelpful(review._id, token);
      
      if (response.success) {
        setIsHelpful(response.data.isHelpful);
        setHelpfulCount(response.data.helpfulCount);
        message.success(response.data.isHelpful ? 'Marked as helpful' : 'Removed helpful mark');
        
        // Call parent callback if provided
        if (onHelpfulToggle) {
          onHelpfulToggle(review._id, response.data);
        }
      }
    } catch (error) {
      console.error('Error toggling helpful status:', error);
      message.error('Failed to update helpful status');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(review);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      message.warning('Please login to delete reviews');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await reviewService.deleteReview(review._id, token);
      
      if (response.success) {
        message.success('Review deleted successfully');
        if (onDelete) {
          onDelete(review._id);
        }
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const isOwner = isAuthenticated && user?._id === review.userId?._id;

  return (
    <Card 
      className={`review-card ${compact ? 'compact' : ''}`}
      size={compact ? 'small' : 'default'}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* User Info & Rating */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Avatar 
              size={compact ? 'default' : 'large'}
              src={review.userId?.profileImage}
              icon={<UserOutlined />}
              className="bg-blue-500"
            />
            <div className="flex flex-col">
              <Text strong className="text-sm sm:text-base">
                {review.userId?.fullName || 'Anonymous User'}
              </Text>
              <Text type="secondary" className="text-xs">
                {formatDate(review.createdAt)}
              </Text>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Rate 
              disabled 
              value={review.rating} 
              className="text-xs sm:text-sm"
            />
            <Text className="text-xs sm:text-sm text-gray-600">
              {review.rating}/5
            </Text>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <Paragraph 
            className={`mb-2 ${compact ? 'text-sm' : 'text-base'}`}
            ellipsis={compact ? { rows: 2, expandable: true } : false}
          >
            {review.comment}
          </Paragraph>
          
          {/* Helpful Button & Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="text"
                size="small"
                icon={isHelpful ? <LikeFilled /> : <LikeOutlined />}
                loading={loading}
                onClick={handleHelpfulToggle}
                className={`${isHelpful ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500`}
              >
                <span className="hidden sm:inline">
                  {isHelpful ? 'Helpful' : 'Helpful'}
                </span>
                <span className="ml-1 text-xs">
                  ({helpfulCount})
                </span>
              </Button>
            </div>

            {/* Action Buttons */}
            {showActions && isOwner && (
              <Space size="small">
                <Tooltip title="Edit review">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    className="text-blue-500 hover:text-blue-600"
                  />
                </Tooltip>
                
                <Popconfirm
                  title="Delete Review"
                  description="Are you sure you want to delete this review? This action cannot be undone."
                  onConfirm={handleDelete}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Delete review">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={loading}
                      className="text-red-500 hover:text-red-600"
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;
