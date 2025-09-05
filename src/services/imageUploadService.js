import apiService from './apiService';
import { getApiUrl } from '../config/api';

class ImageUploadService {
  // Upload product images
  async uploadProductImages(productId, imageFiles, token) {
    try {
      // Validate input
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      if (!imageFiles || imageFiles.length === 0) {
        throw new Error('No images provided');
      }

      if (imageFiles.length > 10) {
        throw new Error('Too many files. Maximum is 10 files.');
      }

      // Create FormData
      const formData = new FormData();
      
      // Add each image file to FormData
      Array.from(imageFiles).forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed!');
        }
        
        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
        }
        
        formData.append('images', file);
      });

      console.log('📸 Uploading images for product:', productId);
      console.log('📁 Number of files:', imageFiles.length);
      console.log('📏 File sizes:', Array.from(imageFiles).map(f => `${f.name}: ${(f.size / 1024 / 1024).toFixed(2)}MB`));

      // Make the request using the API config
      const url = getApiUrl(`/products/seller/${productId}/images`);
      console.log('🌐 Upload URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formData
      });

      console.log('📡 Upload response status:', response.status);
      console.log('📡 Upload response headers:', response.headers);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('❌ Upload failed:', data);
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      console.log('✅ Images uploaded successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Error uploading images:', error);
      throw error;
    }
  }

  // Delete product image
  async deleteProductImage(productId, imageUrl, token) {
    try {
      const endpoint = `/products/seller/${productId}/images`;
      const response = await apiService.delete(endpoint, token);
      
      if (response.success) {
        console.log('✅ Image deleted successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  }

  // Get product images
  async getProductImages(productId) {
    try {
      const endpoint = `/products/${productId}/images`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('❌ Error fetching product images:', error);
      throw error;
    }
  }
}

// Create and export image upload service instance
const imageUploadService = new ImageUploadService();
export default imageUploadService;
