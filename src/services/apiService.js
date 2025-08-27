import API_CONFIG, { getApiUrl, getAuthHeaders } from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const config = {
      headers: API_CONFIG.DEFAULT_HEADERS,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
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
    const headers = token ? getAuthHeaders(token) : API_CONFIG.DEFAULT_HEADERS;
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
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