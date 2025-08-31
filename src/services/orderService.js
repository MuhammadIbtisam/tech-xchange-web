import apiService from './apiService';

class OrderService {
  // Create a new order for a single product
  async createOrder(productId, orderData, token) {
    try {
      console.log('🚀 Creating order for product:', productId);
      console.log('📦 Order data:', orderData);
      const response = await apiService.post(`/orders/buyer/product/${productId}`, orderData, token);
      console.log('✅ Order created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  // Get orders for buyer
  async getBuyerOrders(token) {
    try {
      console.log('🔍 Fetching buyer orders...');
      // Try different possible endpoints
      let response;
      try {
        response = await apiService.get('/orders/buyer/my-orders', token);
      } catch (error) {
        if (error.message.includes('404')) {
          console.log('🔄 Trying alternative endpoint: /orders/buyer');
          try {
            response = await apiService.get('/orders/buyer', token);
          } catch (secondError) {
            if (secondError.message.includes('404')) {
              console.log('🔄 Trying general orders endpoint: /orders');
              response = await apiService.get('/orders', token);
            } else {
              throw secondError;
            }
          }
        } else {
          throw error;
        }
      }
      console.log('✅ Buyer orders fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching buyer orders:', error);
      throw error;
    }
  }

  // Get orders for seller
  async getSellerOrders(token) {
    try {
      console.log('🔍 Fetching seller orders...');
      const response = await apiService.get('/orders/seller/my-orders', token);
      console.log('✅ Seller orders fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching seller orders:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId, token) {
    try {
      console.log('🔍 Fetching order:', orderId);
      const response = await apiService.get(`/orders/${orderId}`, token);
      console.log('✅ Order fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, token, userRole = 'seller') {
    try {
      console.log('🔄 Updating order status:', { orderId, status, userRole });
      
      // Use the correct endpoint based on user role
      const endpoint = userRole === 'seller' 
        ? `/orders/seller/${orderId}/status`
        : `/orders/buyer/${orderId}/status`;
      
      console.log('🔗 Calling endpoint:', endpoint);
      console.log('📤 Request payload:', { status });
      console.log('🔑 Token present:', !!token);
      
      const response = await apiService.put(endpoint, { status }, token);
      console.log('✅ Order status updated:', response);
      
      // Check if the backend operation was successful
      if (response && response.success === false) {
        throw new Error(response.message || 'Status update failed');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, token) {
    try {
      console.log('❌ Cancelling order:', orderId);
      const response = await apiService.put(`/orders/${orderId}/cancel`, {}, token);
      console.log('✅ Order cancelled:', response);
      return response;
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw error;
    }
  }

  // Get order statistics
  async getOrderStats(token, userRole) {
    try {
      console.log('📊 Fetching order statistics for:', userRole);
      const endpoint = userRole === 'seller' ? '/orders/seller/stats' : '/orders/buyer/stats';
      const response = await apiService.get(endpoint, token);
      console.log('✅ Order stats fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching order stats:', error);
      throw error;
    }
  }
}

export default new OrderService();
