import apiService from './apiService';

class UserService {
  async updateProfile(profileData, token) {
    try {
      console.log('🔄 UserService.updateProfile called');
      console.log(' Data to send:', profileData);
      console.log(' Token present:', !!token);
      console.log('🔗 Endpoint: /auth/profile');
      
      // Using the working /auth/profile endpoint that now accepts:
      // fullName, email, phoneNumber, address, preferences
      const response = await apiService.put('/auth/profile', profileData, token);
      console.log(' Profile updated successfully:', response);
      
      return response;
    } catch (error) {
      console.error(' UserService.updateProfile error:', error);
      console.error(' Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }

  async updateSettings(settingsData, token) {
    try {
      console.log('🔄 UserService.updateSettings called');
      
      // Settings are now part of the profile update
      // Send settings data to the profile endpoint
      const response = await apiService.put('/auth/profile', settingsData, token);
      console.log(' Settings updated successfully:', response);
      
      return response;
    } catch (error) {
      console.error(' UserService.updateSettings error:', error);
      throw error;
    }
  }

  async getUserProfile(token) {
    try {
      console.log('🔄 UserService.getUserProfile called');
      console.log(' Token present:', !!token);
      console.log('🔗 Endpoint: /auth/me');
      
      // Using the existing /auth/me endpoint from your API
      const response = await apiService.get('/auth/me', token);
      console.log(' Profile fetched successfully:', response);
      
      return response;
    } catch (error) {
      console.error(' UserService.getUserProfile error:', error);
      console.error(' Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }

  async getUserSettings(token) {
    try {
      console.log('🔄 UserService.getUserSettings called');
      
      // Settings are now part of the user profile
      const response = await apiService.get('/auth/me', token);
      console.log(' Settings fetched successfully:', response);
      
      return response;
    } catch (error) {
      console.error(' UserService.getUserSettings error:', error);
      throw error;
    }
  }
}

export default new UserService();
