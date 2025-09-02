import apiService from './apiService';
import { API_CONFIG } from '../config/api';

class ProductService {
  // Get all products with filtering, search, and pagination
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add all possible query parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.search) queryParams.append('search', params.search);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);
    if (params.condition) queryParams.append('condition', params.condition);
    if (params.exclude) queryParams.append('exclude', params.exclude);

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiService.get(endpoint);
  }

  // Get single product by ID
  async getProductById(productId) {
    return await apiService.get(`/products/${productId}`);
  }

  // Get product reviews
  async getProductReviews(productId) {
    return await apiService.get(`/reviews/product/${productId}`);
  }

  // Get all categories
  async getCategories() {
    return await apiService.get('/categories');
  }

  // Get all brands
  async getBrands() {
    return await apiService.get('/brands');
  }

  // Get product types by category
  async getProductTypesByCategory(categoryId) {
    return await apiService.get(`/product-types/category/${categoryId}`);
  }

  // Seller: Create new product
  async createProduct(productData, token) {
    console.log('🚀 Creating product:', productData);
    try {
      const response = await apiService.post('/products/seller', productData, token);
      console.log('✅ Product created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw error;
    }
  }

  // Seller: Update product
  async updateProduct(productId, productData, token) {
    return await apiService.put(`/products/seller/${productId}`, productData, token);
  }

  // Seller: Delete product
  async deleteProduct(productId, token) {
    return await apiService.delete(`/products/seller/${productId}`, token);
  }

  // Seller: Get my products
  async getMyProducts(token) {
    return await apiService.get('/products/seller/my-products', token);
  }

  // Seller: Upload product images
  async uploadProductImages(productId, images, token) {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('images', image);
    });
    
    return await apiService.post(`/products/seller/${productId}/images`, formData, token, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Admin: Get pending products
  async getPendingProducts(token) {
    return await apiService.get('/products/admin/pending', token);
  }

  // Admin: Approve product
  async approveProduct(productId, token) {
    // For approval, we don't need to send any data in the body
    return await apiService.put(`/products/admin/${productId}/approve`, {}, token);
  }

  // Admin: Reject product
  async rejectProduct(productId, token, adminNotes = '') {
    const requestBody = adminNotes ? { adminNotes } : {};
    return await apiService.put(`/products/admin/${productId}/reject`, requestBody, token);
  }

  // Admin: Get all products
  async getAllProductsForAdmin(token) {
    return await apiService.get('/products/admin/all', token);
  }

  // User: Add product to saved items
  async addToSavedItems(productId, token, notes = '') {
    console.log(' Adding to saved items:', { productId, notes, token: token ? 'Present' : 'Missing' });
    try {
      const requestBody = notes ? { notes } : {};
      const response = await apiService.post(`/saved-items/user/product/${productId}`, requestBody, token);
      console.log(' Save response:', response);
      return response;
    } catch (error) {
      console.error(' Save error:', error);
      console.error(' Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        productId,
        notes,
        hasToken: !!token
      });
      
      // Check if it's a backend error
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        console.error(' Backend error detected - this is a server-side issue');
        console.error(' The saved items endpoint may not be implemented or has a bug');
      }
      
      throw error;
    }
  }

  // User: Remove product from saved items
  async removeFromSavedItems(savedItemId, token) {
    console.log(' Removing from saved items:', { savedItemId, token: token ? 'Present' : 'Missing' });
    try {
      const response = await apiService.delete(`/saved-items/user/${savedItemId}`, token);
      console.log(' Remove response:', response);
      return response;
    } catch (error) {
      console.error(' Remove error:', error);
      throw error;
    }
  }

  // User: Check if product is saved
  async checkIfSaved(productId, token) {
    console.log(' Checking if saved:', { productId, token: token ? 'Present' : 'Missing' });
    try {
      const response = await apiService.get(`/saved-items/user/check/${productId}`, token);
      console.log(' Check response:', response);
      return response;
    } catch (error) {
      console.error(' Check error:', error);
      throw error;
    }
  }

  // User: Get my saved items
  async getMySavedItems(token, options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      sortBy = 'dateAdded',
      order = 'desc'
    } = options;

    console.log('🔄 Getting saved items with options:', { 
      page, limit, search, category, minPrice, maxPrice, sortBy, order 
    });

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);

      const endpoint = `/saved-items/user/my-saved-items?${params.toString()}`;
      const response = await apiService.get(endpoint, token);
      
      console.log('📥 Get saved items response:', response);
      return response;
    } catch (error) {
      console.error('❌ Get saved items error:', error);
      throw error;
    }
  }

  // User: Update saved item notes
  async updateSavedItem(savedItemId, notes, token) {
    console.log(' Updating saved item:', { savedItemId, notes, token: token ? 'Present' : 'Missing' });
    try {
      const response = await apiService.put(`/saved-items/user/${savedItemId}`, { notes }, token);
      console.log(' Update saved item response:', response);
      return response;
    } catch (error) {
      console.error(' Update saved item error:', error);
      throw error;
    }
  }
}

export default new ProductService();
