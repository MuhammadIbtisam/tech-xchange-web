import apiService from './apiService.js';
import API_CONFIG from '../config/api.js';

class AuthService {
  // Register user
  async register(userData) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  // Login user
  async login(credentials) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
  }
}

const authService = new AuthService();
export default authService; 