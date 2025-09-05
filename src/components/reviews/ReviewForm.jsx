import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Rate, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  message,
  Modal
} from 'antd';
import { StarOutlined, SendOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ReviewForm = ({ 
  productId, 
  productName, 
  onSuccess, 
  onCancel, 
  editReview = null,
  visible = true,
  onClose
}) => {
  const { isAuthenticated, user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  // Debug: Log user data
  console.log('🔍 ReviewForm - User data:', user);
  console.log('🔍 ReviewForm - User ID:', user?._id);
  console.log('🔍 ReviewForm - Is authenticated:', isAuthenticated);

  // Initialize form with edit data if provided
  useEffect(() => {
    if (editReview) {
      form.setFieldsValue({
        rating: editReview.rating,
        comment: editReview.comment
      });
      setRating(editReview.rating);
    } else {
      form.resetFields();
      setRating(0);
    }
  }, [editReview, form]);

  const handleSubmit = async (values) => {
    if (!isAuthenticated) {
      message.warning('Please login to write reviews');
      return;
    }

    // Check for userId in context or localStorage
    const userId = user?._id || JSON.parse(localStorage.getItem('user') || '{}')._id;
    if (!userId) {
      message.error('User information not available. Please login again.');
      return;
    }

    if (!values.rating || values.rating < 1) {
      message.error('Please select a rating');
      return;
    }

    if (!values.comment || values.comment.trim().length < 10) {
      message.error('Please write at least 10 characters');
      return;
    }

    if (values.comment.trim().length > 1000) {
      message.error('Comment must be less than 1000 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get userId from context or localStorage as fallback
      const userId = user?._id || JSON.parse(localStorage.getItem('user') || '{}')._id;
      
      if (!userId) {
        message.error('User ID not found. Please login again.');
        return;
      }

      const reviewData = {
        rating: values.rating,
        comment: values.comment.trim(),
        userId: userId
      };

      console.log('📝 Submitting review data:', reviewData);
      console.log('👤 User ID from context:', user?._id);
      console.log('👤 User ID from localStorage:', JSON.parse(localStorage.getItem('user') || '{}')._id);
      console.log('👤 Final User ID used:', userId);
      console.log('🔗 Product ID:', productId);
      console.log('🎫 Token present:', !!token);

      let response;
      if (editReview) {
        // Update existing review
        response = await reviewService.updateReview(editReview._id, reviewData, token);
      } else {
        // Create new review
        response = await reviewService.createReview(productId, reviewData, token);
      }

      if (response.success) {
        message.success(editReview ? 'Review updated successfully' : 'Review submitted successfully');
        form.resetFields();
        setRating(0);
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (error.message.includes('401')) {
        message.error('Please login to write reviews');
      } else if (error.message.includes('403')) {
        message.error('You can only review products you have purchased');
      } else if (error.message.includes('400')) {
        message.error('Invalid review data. Please check your input.');
      } else {
        message.error(`Failed to submit review: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (value) => {
    setRating(value);
    form.setFieldsValue({ rating: value });
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

  const formContent = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="review-form"
    >
      {/* Product Info */}
      {productName && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <Text strong>Reviewing: {productName}</Text>
        </div>
      )}

      {/* Rating */}
      <Form.Item
        name="rating"
        label="Rating"
        rules={[
          { required: true, message: 'Please select a rating' },
          { type: 'number', min: 1, max: 5, message: 'Rating must be between 1 and 5' }
        ]}
      >
        <div className="space-y-2">
          <Rate 
            value={rating}
            onChange={handleRatingChange}
            className="text-2xl"
          />
          {rating > 0 && (
            <Text className="text-gray-600">
              {getRatingText(rating)}
            </Text>
          )}
        </div>
      </Form.Item>

      {/* Comment */}
      <Form.Item
        name="comment"
        label="Your Review"
        rules={[
          { required: true, message: 'Please write a review' },
          { min: 10, message: 'Review must be at least 10 characters' },
          { max: 1000, message: 'Review must be less than 1000 characters' }
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Share your experience with this product..."
          showCount
          maxLength={1000}
          className="resize-none"
        />
      </Form.Item>

      {/* Character count helper */}
      <div className="text-xs text-gray-500 mb-4">
        <Text type="secondary">
          Minimum 10 characters, maximum 1000 characters
        </Text>
      </div>

      {/* Action Buttons */}
      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={onCancel || (() => onClose && onClose())}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SendOutlined />}
            disabled={!rating || loading}
          >
            {editReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  // If it's a modal, wrap in Modal component
  if (visible !== undefined) {
    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            <StarOutlined className="text-yellow-500" />
            <span>{editReview ? 'Edit Review' : 'Write a Review'}</span>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
        className="review-modal"
        destroyOnClose
      >
        {formContent}
      </Modal>
    );
  }

  // If it's not a modal, return as card
  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <StarOutlined className="text-yellow-500" />
          <span>{editReview ? 'Edit Review' : 'Write a Review'}</span>
        </div>
      }
      className="review-form-card"
    >
      {formContent}
    </Card>
  );
};

export default ReviewForm;
