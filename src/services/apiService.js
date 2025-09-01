import API_CONFIG, { getApiUrl, getAuthHeaders } from '../config/api.js';

class ApiService {
  constructor() {
    this.timeout = API_CONFIG.TIMEOUT || 10000;
  }

  async request(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    console.log('🌐 Making HTTP request to:', url);
    console.log('📋 Request options:', options);
    
    const config = {
      headers: API_CONFIG.DEFAULT_HEADERS,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      console.log('📡 Sending fetch request...');
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      clearTimeout(timeoutId);

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle HTTP errors
      if (!response.ok) {
        // For 400 status, return the data so validation errors can be handled properly
        if (response.status === 400) {
          return data;
        }
        
        // For 500 errors, try to get more details
        if (response.status === 500) {
          console.error(' Backend 500 error details:', data);
          console.error(' Error data type:', typeof data);
          console.error(' Error data keys:', Object.keys(data || {}));
          console.error(' Full error response:', JSON.stringify(data, null, 2));
          
          // Try to extract more specific error information
          let errorMessage = 'Internal server error';
          if (data && typeof data === 'object') {
            if (data.message) errorMessage = data.message;
            else if (data.error) errorMessage = data.error;
            else if (data.errors) errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : JSON.stringify(data.errors);
            else errorMessage = JSON.stringify(data);
          }
          
          throw new Error(`Server error: ${errorMessage}`);
        }
        
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // GET request
  async get(endpoint, token = null) {
    const headers = token ? getAuthHeaders(token) : API_CONFIG.DEFAULT_HEADERS;
    return this.request(endpoint, { method: 'GET', headers });
  }

  // POST request
  async post(endpoint, data, token = null) {
    const headers = token ? getAuthHeaders(token) : API_CONFIG.DEFAULT_HEADERS;
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data, token = null) {
    console.log('🔄 ApiService.put called');
    console.log('🔗 Endpoint:', endpoint);
    console.log(' Data:', data);
    console.log(' Token present:', !!token);
    
    const headers = token ? getAuthHeaders(token) : API_CONFIG.DEFAULT_HEADERS;
    console.log('📋 Headers:', headers);
    
    const result = await this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    console.log('📥 ApiService.put result:', result);
    return result;
  }

  // DELETE request
  async delete(endpoint, token = null) {
    const headers = token ? getAuthHeaders(token) : API_CONFIG.DEFAULT_HEADERS;
    return this.request(endpoint, { method: 'DELETE', headers });
  }

}

// Create and export API service instance
const apiService = new ApiService();
export default apiService; 