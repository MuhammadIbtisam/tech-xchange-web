import apiService from './apiService';

class ReviewService {
  // Get product reviews with pagination and filtering
  async getProductReviews(productId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.rating) queryParams.append('rating', params.rating);
      if (params.sort) queryParams.append('sort', params.sort);
      
      const endpoint = `/reviews/product/${productId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }

  // Create a new review
  async createReview(productId, reviewData, token) {
    try {
      const endpoint = `/reviews/product/${productId}`;
      return await apiService.post(endpoint, reviewData, token);
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Update a review
  async updateReview(reviewId, reviewData, token) {
    try {
      const endpoint = `/reviews/${reviewId}`;
      return await apiService.put(endpoint, reviewData, token);
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId, token) {
    try {
      const endpoint = `/reviews/${reviewId}`;
      return await apiService.delete(endpoint, token);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Toggle helpful status for a review
  async toggleHelpful(reviewId, token) {
    try {
      const endpoint = `/reviews/${reviewId}/helpful`;
      return await apiService.post(endpoint, {}, token);
    } catch (error) {
      console.error('Error toggling helpful status:', error);
      throw error;
    }
  }

  // Get user's reviews
  async getUserReviews(params = {}, token) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const endpoint = `/reviews/user/my-reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint, token);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }
}

// Create and export review service instance
const reviewService = new ReviewService();
export default reviewService;
