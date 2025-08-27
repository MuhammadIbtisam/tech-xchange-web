// Basic API Configuration
export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: 'http://localhost:3000/api',
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    Authorization: `Bearer ${token}`,
  };
};

export default API_CONFIG; 