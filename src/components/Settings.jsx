import React, { useState, useEffect, useRef } from 'react';
import { Card, Switch, Select, Button, Typography, Space, Divider, Row, Col, Input, message, Spin } from 'antd';
import { SettingOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings = () => {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Refs for input fields
  const displayNameRef = useRef(null);
  const emailRef = useRef(null);

  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    language: 'en',
  });

  const [profile, setProfile] = useState({
    displayName: user?.fullName || '',
    email: user?.email || '',
  });

  console.log(' Settings component render:', { 
    user: user ? { fullName: user.fullName, email: user.email } : null, 
    token: !!token,
    profile,
    settings
  });
  
  // Load user data on component mount
  useEffect(() => {
    if (user && token) {
      loadUserData();
    }
  }, [user, token]);

  // Update profile when user context changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        displayName: user.fullName || prev.displayName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Debug component mount
  useEffect(() => {
    console.log('🏗️ Settings component mounted');
    console.log(' Initial user data:', user);
    console.log(' Initial token:', !!token);
    console.log(' Initial profile state:', profile);
    console.log(' Initial settings state:', settings);
  }, []);

  // Monitor state changes
  useEffect(() => {
    console.log('🔄 Profile state changed:', profile);
  }, [profile]);

  useEffect(() => {
    console.log('🔄 Settings state changed:', settings);
  }, [settings]);

  // Force input field updates when profile changes
  useEffect(() => {
    console.log('🔄 Profile state updated:', profile);
    
    // Force input field updates if refs are available
    if (displayNameRef.current && profile.displayName !== undefined) {
      displayNameRef.current.input.value = profile.displayName;
    }
    
    if (emailRef.current && profile.email !== undefined) {
      emailRef.current.input.value = profile.email;
    }
  }, [profile]);

  const loadUserData = async () => {
    try {
      setInitialLoading(true);
      
      console.log('🔄 Loading user data...');
      console.log(' User context:', { fullName: user?.fullName, email: user?.email });
      
      // Set initial profile data from user context
      setProfile({
        displayName: user?.fullName || '',
        email: user?.email || '',
      });
      
      // Try to load additional data from API
      if (token) {
        const profileData = await userService.getUserProfile(token);
        console.log('📥 API profile data:', profileData);
        
        if (profileData?.user) {
          setProfile({
            displayName: profileData.user.fullName || user?.fullName || '',
            email: profileData.user.email || user?.email || '',
          });
        }
        
        // Load settings if available
        if (profileData?.user?.preferences?.notifications) {
          setSettings({
            notifications: profileData.user.preferences.notifications.push ?? true,
            emailNotifications: profileData.user.preferences.notifications.email ?? true,
            language: profileData.user.preferences.language ?? 'en',
          });
        }
      }
      
    } catch (error) {
      console.error(' Error loading user data:', error);
      // Keep the fallback data from user context
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Show current state
  const showCurrentState = () => {
    console.log(' Current component state:');
    console.log('  - Profile state:', profile);
    console.log('  - Settings state:', settings);
    console.log('  - User context:', user);
    console.log('  - Last update:', lastUpdate);
    
    message.info(`Profile: ${profile.displayName}, Email: ${profile.email}`);
  };

  // Refresh data from backend
  const refreshData = async () => {
    if (!token) {
      message.error('Not authenticated');
      return;
    }

    try {
      setInitialLoading(true);
      await loadUserData();
      message.success('Data refreshed successfully!');
    } catch (error) {
      console.error(' Error refreshing data:', error);
      message.error('Failed to refresh data');
    } finally {
      setInitialLoading(false);
    }
  };

  // Force refresh from backend
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing data from backend...');
    
    if (!token) {
      message.error('Not authenticated');
      return;
    }

    try {
      console.log('📡 Fetching fresh data from backend...');
      const response = await userService.getUserProfile(token);
      console.log('📥 Fresh data response:', response);
      
      if (response?.user) {
        const freshData = response.user;
        console.log('🔄 Updating state with fresh data:', freshData);
        
        const newProfile = {
          displayName: freshData.fullName || '',
          email: freshData.email || '',
        };
        
        const newSettings = {
          notifications: freshData.preferences?.notifications?.push ?? true,
          emailNotifications: freshData.preferences?.notifications?.email ?? true,
          language: settings.language,
        };
        
        console.log('🔄 Setting fresh profile:', newProfile);
        console.log('🔄 Setting fresh settings:', newSettings);
        
        setProfile(newProfile);
        setSettings(newSettings);
        setLastUpdate(Date.now());
        
        console.log(' Fresh data loaded successfully');
        message.success('Fresh data loaded from backend!');
      } else {
        console.log(' No user data in response');
        message.warning('No user data received from backend');
      }
    } catch (error) {
      console.error(' Error force refreshing:', error);
      message.error('Failed to refresh from backend');
    }
  };

  // Check localStorage token
  const checkLocalStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log(' LocalStorage check:');
    console.log('  - Token:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');
    console.log('  - User:', storedUser ? JSON.parse(storedUser) : 'null');
    console.log('  - Context token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('  - Context user:', user);
  };

  // Test function to debug API calls
  const testAPICall = async () => {
    console.log(' Test API call started');
    console.log(' User context:', user);
    console.log(' Token available:', !!token);
    console.log(' Token length:', token ? token.length : 0);

    if (!token) {
      console.log(' No token available');
      message.error('No authentication token available');
      return;
    }

    try {
      console.log(' Testing simple API call...');
      const testData = { fullName: 'TEST NAME', email: 'test@test.com' };
      console.log(' Test data:', testData);

      const response = await userService.updateProfile(testData, token);
      console.log('📥 Test response:', response);

      if (response?.success) {
        message.success('Test API call successful!');
        
        // Try to update local state with the response data
        console.log('🔄 Updating local state with test response...');
        console.log('📥 Response user data:', response.user);
        
        if (response.user) {
          const newProfile = {
            displayName: response.user.fullName || 'TEST NAME',
            email: response.user.email || 'test@test.com',
          };
          
          console.log('🔄 Setting new profile state:', newProfile);
          setProfile(newProfile);
          setLastUpdate(Date.now());
          
          console.log(' Local state updated with test data');
          message.info('Local state updated with test data');
        }
      } else {
        message.error('Test API call failed');
      }

    } catch (error) {
      console.error(' Test failed:', error);
      message.error(`Test failed: ${error.message}`);
    }
  };

  const handleSave = async () => {
    console.log('🚀 Save button clicked!');
    console.log(' Current state:', { profile, settings, user, token: !!token });
    
    if (!token) {
      message.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Update profile
      console.log(' Step 1: Updating profile...');
      const profileData = {
        fullName: profile.displayName,
        email: profile.email
      };
      
      console.log(' Profile data to send:', profileData);
      const profileResponse = await userService.updateProfile(profileData, token);
      console.log('📥 Profile response:', profileResponse);
      
      if (profileResponse?.success) {
        message.success('Profile updated successfully!');
        
        // Update local state with the response data
        if (profileResponse.user) {
          const updatedProfile = {
            displayName: profileResponse.user.fullName || profile.displayName,
            email: profileResponse.user.email || profile.email,
          };
          
          setProfile(updatedProfile);
          console.log(' Local state updated with saved data:', updatedProfile);
          
          // Update global user state in AuthContext
          const updatedUser = {
            ...user,
            fullName: profileResponse.user.fullName,
            email: profileResponse.user.email,
          };
          
          updateUser(updatedUser);
          console.log(' Global user state updated:', updatedUser);
        }
      } else {
        throw new Error('Profile update failed');
      }
      
      // Step 2: Update settings
      console.log(' Step 2: Updating settings...');
      const settingsData = {
        preferences: {
          notifications: {
            email: settings.emailNotifications,
            push: settings.notifications
          }
        }
      };
      
      console.log(' Settings data to send:', settingsData);
      const settingsResponse = await userService.updateProfile(settingsData, token);
      console.log('📥 Settings response:', settingsResponse);
      
      if (!settingsResponse?.success) {
        message.warning('Profile updated but settings failed to update');
        return;
      }
      
      message.success('Settings updated successfully!');

      const updatedFields = [];
      if (profile.displayName !== user?.fullName) updatedFields.push('Display Name');
      if (profile.email !== user?.email) updatedFields.push('Email');
      if (settings.notifications !== true) updatedFields.push('Push Notifications');
      if (settings.emailNotifications !== true) updatedFields.push('Email Notifications');

      if (updatedFields.length > 0) {
        message.info(`Updated: ${updatedFields.join(', ')}`);
      }

      // Automatically refresh data from backend to ensure UI is up to date
      console.log('🔄 Auto-refreshing data after successful save...');
      await forceRefresh();
      
    } catch (error) {
      console.error(' Error saving settings:', error);
      console.error(' Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      message.error(`Failed to save: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <Text className="ml-3">Loading your settings...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Settings */}
      <Card title="Application Settings" icon={<SettingOutlined />}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <Select
                key={`language-${lastUpdate}`}
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
                className="w-full"
              >
                <Option value="en">English</Option>
                <Option value="es">Spanish</Option>
                <Option value="fr">French</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Notification Settings */}
      <Card title="Notification Settings" icon={<BellOutlined />}>
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Push Notifications</Text>
              <br />
              <Text type="secondary">Receive notifications on your device</Text>
            </div>
            <Switch
              checked={settings.notifications}
              onChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>
          
          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Email Notifications</Text>
              <br />
              <Text type="secondary">Receive notifications via email</Text>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
        </Space>
      </Card>

      {/* Save Button */}
      <div className="text-center space-y-4">
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          loading={loading}
          disabled={loading}
          className="px-8"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Settings; 