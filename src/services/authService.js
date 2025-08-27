import apiService from './apiService.js';
import API_CONFIG from '../config/api.js';

class AuthService {
  // Register user
  async register(userData) {
    try {
      console.log('AuthService: Registering user with data:', userData);
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      console.log('AuthService: Register response:', response);
      
      // Check if response indicates an error (even with 200 status)
      if (response && response.success === false) {
        // Handle validation errors
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(response.message || 'Registration failed');
      }
      
      return response;
    } catch (error) {
      console.error('AuthService: Register error:', error);
      
      // If the error message contains specific validation errors, use those
      if (error.message.includes('Full name is required') || 
          error.message.includes('Valid email is required') ||
          error.message.includes('Valid phone number is required') ||
          error.message.includes('Password must be at least 6 characters') ||
          error.message.includes('Password must contain at least one uppercase letter') ||
          error.message.includes('Role must be buyer, seller, or admin') ||
          error.message.includes('validation') || 
          error.message.includes('required')) {
        throw new Error(error.message);
      }
      
      // Re-throw with additional context
      if (error.message.includes('HTTP error! status: 400')) {
        // Check if it's a validation error
        if (error.message.includes('validation') || error.message.includes('required')) {
          throw new Error('Please check your input. All fields are required and must be valid.');
        } else {
          throw new Error('Invalid registration data. Please check your information.');
        }
      } else if (error.message.includes('HTTP error! status: 409')) {
        throw new Error('Email or phone number already exists.');
      } else if (error.message.includes('HTTP error! status: 500')) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  }
  // Login user
  async login(credentials) {
    try {
      console.log('AuthService: Logging in user with credentials:', credentials);
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      console.log('AuthService: Login response:', response);
      
      // Check if response indicates an error (even with 200 status)
      if (response && response.success === false) {
        console.log('AuthService: Response indicates error, response:', response);
        // Handle validation errors
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.map(err => err.msg).join(', ');
          console.log('AuthService: Throwing validation error:', errorMessages);
          throw new Error(errorMessages);
        }
        console.log('AuthService: Throwing general error:', response.message || 'Login failed');
        throw new Error(response.message || 'Login failed');
      }
      
      return response;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      
      // If the error message contains specific validation errors, use those
      if (error.message.includes('Valid email is required') || 
          error.message.includes('Password is required') ||
          error.message.includes('validation') || 
          error.message.includes('required')) {
        throw new Error(error.message);
      }
      
      // Re-throw with additional context
      if (error.message.includes('HTTP error! status: 400')) {
        // Check if it's a validation error or authentication error
        if (error.message.includes('validation') || error.message.includes('required')) {
          throw new Error('Please check your input. All fields are required.');
        } else {
          throw new Error('Invalid credentials. Please check your email and password.');
        }
      } else if (error.message.includes('HTTP error! status: 401')) {
        throw new Error('Invalid credentials. Please check your email and password.');
      } else if (error.message.includes('HTTP error! status: 500')) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService; 